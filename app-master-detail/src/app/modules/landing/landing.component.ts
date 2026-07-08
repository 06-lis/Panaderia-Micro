import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Producto {
  productoAlmacenId: number;
  itemId: number;
  nombre: string;
  precio: number;
  stock: number;
  imagen: string;
}

interface CarritoItem extends Producto {
  cantidad: number;
}

import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit, OnDestroy {
  productos: Producto[] = [];
  carrito: CarritoItem[] = [];
  qrUrl: string | null = null;
  
  // Datos del cliente
  cliente = {
    nombre: '',
    apellido: '',
    email: '',
    celular: ''
  };

  loading = false;
  checkoutProcess = false;
  isLoggedIn = false;
  isEmployee = false;

  constructor(private http: HttpClient, private router: Router) {}

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  mostrarMisPedidos = false;
  misPedidos: any[] = [];
  idClienteSession = 0;

  toggleMisPedidos() {
    this.mostrarMisPedidos = !this.mostrarMisPedidos;
    if (this.mostrarMisPedidos) {
      this.cargarMisPedidos();
    }
  }

  cargarMisPedidos() {
    let url = `${environment.URL_SERVICIOS}/landing/mis-pedidos-por-cliente/${this.idClienteSession}`;
    if (this.idClienteSession <= 0) {
      if (!this.cliente.nombre || !this.cliente.apellido) return;
      url = `${environment.URL_SERVICIOS}/landing/mis-pedidos-por-nombre?nombre=${this.cliente.nombre}&apellido=${this.cliente.apellido}`;
    }

    this.http.get<any[]>(url)
      .subscribe({
        next: (res) => {
          this.misPedidos = res;
        },
        error: (err) => {
          console.error('Error cargando pedidos', err);
          Swal.fire('Error', 'No se pudieron cargar tus pedidos.', 'error');
        }
      });
  }

  ngOnInit(): void {
    this.cargarProductos();
    const userJson = sessionStorage.getItem('user');
    if (userJson) {
      this.isLoggedIn = true;
      try {
        const user = JSON.parse(userJson);
        this.isEmployee = user.idEmpleado > 0 || (user.roles && user.roles.some((r: any) => r.nombre_Rol && r.nombre_Rol.toLowerCase() !== 'cliente'));
        this.idClienteSession = user.idCliente || 0;
        
        if (user.fullname) {
          const parts = user.fullname.trim().split(' ');
          this.cliente.nombre = parts[0] || '';
          this.cliente.apellido = parts.slice(1).join(' ') || '';
        } else {
          this.cliente.nombre = user.username || '';
          this.cliente.apellido = '-';
        }
        this.cliente.email = user.username;
        this.cliente.celular = user.celular || '';
      } catch (e) {
        console.error('Error parseando usuario de la sesión', e);
      }
    }
  }

  logout() {
    sessionStorage.clear();
    this.isLoggedIn = false;
    this.isEmployee = false;
    this.cliente = {
      nombre: '',
      apellido: '',
      email: '',
      celular: ''
    };
    this.carrito = [];
    Swal.fire({
      icon: 'success',
      title: 'Sesión Cerrada',
      text: 'Has cerrado sesión correctamente.',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      this.router.navigate(['/principal']);
    });
  }

  cargarProductos() {
    this.loading = true;
    this.http.get<Producto[]>(`${environment.URL_SERVICIOS}/landing/productos`)
      .subscribe({
        next: (res) => {
          this.productos = res.map(p => {
            let imgPath = p.imagen;
            if (imgPath && !imgPath.startsWith('/') && !imgPath.startsWith('http')) {
              imgPath = '/' + imgPath;
            }
            return { ...p, imagen: imgPath ? imgPath + '?v=' + new Date().getTime() : imgPath };
          });
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          Swal.fire('Error', 'No se pudieron cargar los productos.', 'error');
        }
      });
  }

  agregarAlCarrito(producto: Producto) {
    const existe = this.carrito.find(item => item.productoAlmacenId === producto.productoAlmacenId);
    if (existe) {
      if (existe.cantidad < producto.stock) {
        existe.cantidad++;
      } else {
        Swal.fire('Stock agotado', 'No hay más unidades disponibles de este producto.', 'warning');
      }
    } else {
      this.carrito.push({ ...producto, cantidad: 1 });
    }
  }

  quitarDelCarrito(id: number) {
    const index = this.carrito.findIndex(item => item.productoAlmacenId === id);
    if (index !== -1) {
      if (this.carrito[index].cantidad > 1) {
        this.carrito[index].cantidad--;
      } else {
        this.carrito.splice(index, 1);
      }
    }
  }

  get totalCarrito() {
    return this.carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  }

  abrirCheckout() {
    if (this.carrito.length === 0) {
      Swal.fire('Carrito vacío', 'Agrega algunos deliciosos productos primero.', 'info');
      return;
    }
    this.checkoutProcess = true;
  }

  volverAProductos() {
    if (this.qrUrl) {
      // Limpiar carrito si se completó una compra
      this.carrito = [];
    }
    this.checkoutProcess = false;
    this.qrUrl = null;
    this.detenerPolling();
  }

  finalizarCompra() {
    Swal.fire({
      title: '¡Gracias por tu compra!',
      text: 'Hemos recibido tu orden y tu pago será verificado en breve. Nuestro personal aprobará la transacción.',
      icon: 'success',
      confirmButtonColor: '#1A6B4A',
      confirmButtonText: 'Entendido'
    }).then(() => {
      this.volverAProductos();
    });
  }

  pollingInterval: any;

  iniciarPolling(idTransaccion: string) {
    this.detenerPolling(); // Por si acaso
    this.pollingInterval = setInterval(() => {
      this.http.get<any>(`${environment.URL_SERVICIOS}/landing/status-transaccion/${idTransaccion}`)
        .subscribe({
          next: (res) => {
            if (res.estado === 'pagado') {
              this.detenerPolling();
              Swal.close();
              Swal.fire({
                title: '¡Pago Confirmado!',
                text: 'Tu pago ha sido verificado automáticamente. ¡Gracias por tu compra!',
                icon: 'success',
                confirmButtonColor: '#1A6B4A',
                confirmButtonText: 'Ver mis productos'
              }).then(() => {
                this.volverAProductos();
              });
            }
          },
          error: (err) => console.error('Error polling', err)
        });
    }, 5000); // Polling cada 5 segundos
  }

  detenerPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  ngOnDestroy() {
    this.detenerPolling();
  }

  procesarPago() {
    if (!this.cliente.nombre || !this.cliente.apellido || !this.cliente.email) {
      Swal.fire('Atención', 'Por favor, llena tus datos para el pedido.', 'warning');
      return;
    }

    const payload = {
      nombreCliente: this.cliente.nombre,
      apellidoCliente: this.cliente.apellido,
      emailCliente: this.cliente.email,
      celularCliente: this.cliente.celular,
      items: this.carrito.map(item => ({
        productoAlmacenId: item.productoAlmacenId,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio
      }))
    };

    Swal.fire({
      title: 'Procesando...',
      text: 'Generando orden de pago en Libélula',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.http.post<any>(`${environment.URL_SERVICIOS}/landing/checkout`, payload)
      .subscribe({
        next: (res) => {
          Swal.close();
          if (res.success && res.qrUrl) {
            this.qrUrl = res.qrUrl;
            // No limpiamos el carrito aquí para que se siga mostrando el resumen.
            Swal.fire('¡Éxito!', 'Escanea el código QR para realizar el pago.', 'success');
            if (res.idTransaccion) {
              this.iniciarPolling(res.idTransaccion);
            }
          } else {
            Swal.fire('Error', res.message || 'Ocurrió un error al generar el pago.', 'error');
          }
        },
        error: (err) => {
          Swal.close();
          console.error(err);
          Swal.fire('Error', err.error?.message || 'Error de conexión con el servidor.', 'error');
        }
      });
  }
}
