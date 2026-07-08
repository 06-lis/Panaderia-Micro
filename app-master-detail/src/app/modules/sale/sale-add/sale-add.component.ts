import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Customer } from '../../../interfaces/customer.interface';
import { SaleDetail } from '../../../interfaces/sale-detail.inteface';
import { Product } from '../../../interfaces/poduct.interface';
import { SaleService } from '../service/sale.service';
import { CustomerService } from '../../customer/service/customer.service';
import { Router } from '@angular/router';
import { ProductService } from '../../product/service/product.service';
import { Sale } from '../../../interfaces/sale.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpleadoService } from '../../usuario/empleado.service';
import { ProductoAlmacen } from '../../../interfaces/producto-almacen,interface,';
import { ProductoAlmacenService } from '../../product/service/productoAlmacen.service';
import { CartVenta } from '../../../interfaces/detalle-venta.inteface';
import { Almacen } from '../../../interfaces/almacen.interface';
import { User } from '../../../interfaces/user.interface';
import { Venta } from '../../../interfaces/venta.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sale-add',
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './sale-add.component.html',
  styleUrl: './sale-add.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleAddComponent implements OnInit {
  user: User | undefined;
  empleadoNombre: string = 'Cargando...';
  customers: Customer[] = [];
  selectedCustome: Customer | null = null;
  cartItems: CartVenta[] = [];
  searchQuery: string = '';
  filteredProductoAlmacen: ProductoAlmacen[] = [];

  totalAmount: number = 0;
  products: ProductoAlmacen[] = [];
  saleDetails: SaleDetail[] = [];

  constructor(
    private salesService: SaleService,
    private customerService: CustomerService,
    private productService: ProductService,
    private productoAlmacenService: ProductoAlmacenService,
    private empleadoService: EmpleadoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userJson = sessionStorage.getItem('user');
    if (userJson) {
      this.user = JSON.parse(userJson);
      
      const idEmpleado = this.user?.idEmpleado || 1; // Fallback a 1 si no está asignado
      this.empleadoService.getEmpleadoById(idEmpleado).subscribe({
        next: (emp) => {
          if (emp && emp.nombre) {
            this.empleadoNombre = `${emp.nombre} ${emp.apellido}`;
          } else {
            this.empleadoNombre = `Empleado #${idEmpleado}`;
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error al cargar empleado:', err);
          this.empleadoNombre = `Empleado #${idEmpleado}`;
          this.cdr.markForCheck();
        }
      });
    } else {
      this.empleadoNombre = 'Sin empleado asignado';
    }

    this.productoAlmacenService.getProductoAlmacenAll().subscribe({
      next: (data) => {
        // Normalización: asegurar que la relación "item" se mapea a "producto"
        data.forEach(x => {
          if (x.item && !x.producto) {
            x.producto = x.item;
          }
          if (x.producto && x.producto.imagen && !x.producto.imagen.startsWith('/') && !x.producto.imagen.startsWith('http')) {
            x.producto.imagen = '/' + x.producto.imagen;
          }
        });

        // Filtrado: vender únicamente items de tipo 'Producto'
        const productosRaw = data.filter(x => x.producto?.tipo === 'Producto');
        
        // Agrupar por ItemId para mostrar stock global
        const groupedMap = new Map<number, ProductoAlmacen>();
        productosRaw.forEach(pa => {
          const pId = pa.producto?.id || pa.producto?.idProducto || pa.producto?.productoId;
          if (!pId) return;
          
          if (groupedMap.has(pId)) {
            const existing = groupedMap.get(pId)!;
            existing.stock += pa.stock;
          } else {
            // Clonar para no mutar el original y agrupar
            groupedMap.set(pId, {
              ...pa,
              id: pId, // Usaremos el id de ProductoAlmacen como el ID del producto unificado para la UI
              almacen: { id: 0, nombre: 'Global', tipoAlmacen: 'Global' } as any
            });
          }
        });

        this.products = Array.from(groupedMap.values());
        this.filteredProductoAlmacen = [...this.products];
        console.log('Productos de Almacén globales:', this.products);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar productos de almacén:', err);
      }
    });

    this.customerService.getCustomerAll().subscribe({
      next: (data) => {
        this.customers = data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
      }
    });
  }

  addToCart(productoAlmacen: ProductoAlmacen): void {
    const itemId = productoAlmacen.producto?.id || productoAlmacen.producto?.idProducto || productoAlmacen.producto?.productoId;
    const precio = productoAlmacen.producto?.precio || 0;
    const producto = productoAlmacen.producto;

    if (!producto || !itemId) {
      console.warn('Producto no válido.');
      return;
    }

    if (productoAlmacen.stock <= 0) {
      Swal.fire('Sin Stock', 'No hay stock disponible para este producto.', 'warning');
      return;
    }

    // Buscamos por itemId, ya no por productoAlmacenId
    const existingItem = this.cartItems.find(item => {
        const iId = item.producto?.id || item.producto?.idProducto || item.producto?.productoId;
        return iId === itemId;
    });

    if (existingItem) {
      existingItem.cantidad = (existingItem.cantidad ?? 0) + 1;
    } else {
      const detalleventa: CartVenta = {
        productoAlmacenId: productoAlmacen.id!, // Guardamos esto para no romper interface, pero usaremos itemId al mandar backend
        cantidad: 1,
        monto: precio,
        producto: producto,
        alamacen: productoAlmacen.almacen!
      };
      this.cartItems.push(detalleventa);
    }

    productoAlmacen.stock -= 1;
    this.updateTotalAmount();
    this.cdr.markForCheck();
  }

  incrementCartItem(index: number): void {
    const item = this.cartItems[index];
    const itemId = item.producto?.id || item.producto?.idProducto || item.producto?.productoId;
    const productInStock = this.products.find(p => (p.producto?.id || p.producto?.idProducto || p.producto?.productoId) === itemId);
    if (productInStock && (productInStock.stock ?? 0) > 0) {
      item.cantidad = (item.cantidad ?? 0) + 1;
      productInStock.stock = (productInStock.stock ?? 0) - 1;
      this.updateTotalAmount();
      this.cdr.markForCheck();
    } else {
      Swal.fire('Sin stock', 'No hay más unidades disponibles de este producto.', 'warning');
    }
  }

  decrementCartItem(index: number): void {
    const item = this.cartItems[index];
    if (item.cantidad && item.cantidad > 1) {
      item.cantidad -= 1;
      const itemId = item.producto?.id || item.producto?.idProducto || item.producto?.productoId;
      const productInStock = this.products.find(p => (p.producto?.id || p.producto?.idProducto || p.producto?.productoId) === itemId);
      if (productInStock) {
        productInStock.stock = (productInStock.stock ?? 0) + 1;
      }
      this.updateTotalAmount();
      this.cdr.markForCheck();
    } else {
      this.removeItem(index);
    }
  }

  removeItem(index: number): void {
    const item = this.cartItems[index];
    if (!item) return;

    const itemId = item.producto?.id || item.producto?.idProducto || item.producto?.productoId;
    const itemProduct = this.products.find(p => (p.producto?.id || p.producto?.idProducto || p.producto?.productoId) === itemId);
    if (itemProduct) {
      itemProduct.stock = (itemProduct.stock ?? 0) + (item.cantidad ?? 0);
    }
    this.cartItems.splice(index, 1);
    this.updateTotalAmount();
    this.cdr.markForCheck();
  }

  updateTotalAmount(): void {
    this.totalAmount = this.cartItems.reduce(
      (total, detail) => total + (detail.cantidad ?? 0) * (detail.producto?.precio ?? 0),
      0
    );
  }

  async createSale() {
    if (!this.selectedCustome) {
      Swal.fire('Cliente requerido', 'Por favor selecciona un cliente antes de continuar.', 'warning');
      return;
    }
    if (this.cartItems.length === 0) {
      Swal.fire('Carrito vacío', 'Por favor agrega al menos un producto al carrito.', 'warning');
      return;
    }

    // Mostrar overlay de carga
    Swal.fire({
      title: 'Procesando venta...',
      text: 'Verificando stock global y registrando transacción.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // Como ahora el backend hace el descuento inteligente con PEPS/UEPS,
      // enviamos la Venta Completa en una sola transacción.
      
      const ventaCompleta = {
        clienteId: this.selectedCustome.id!,
        usuarioId: this.user?.userId || 1, // Fallback a usuario ID 1 si no está asignado
        items: this.cartItems.map(item => ({
            itemId: item.producto.id || item.producto.idProducto || item.producto.productoId,
            cantidad: item.cantidad,
            monto: item.monto! * item.cantidad!
        }))
      };

      console.log('Enviando Venta Completa al backend:', ventaCompleta);

      // Llamar al nuevo endpoint transaccional
      const response = await this.salesService.createVentaCompleta(ventaCompleta).toPromise();
      console.log('Venta completa procesada en backend:', response);

      // Cierre exitoso
      Swal.close();
      Swal.fire({
        icon: 'success',
        title: 'Venta Registrada',
        text: 'La venta ha sido procesada y el stock ha sido actualizado inteligentemente.',
        confirmButtonText: 'Entendido'
      }).then(() => {
        this.router.navigate(['/dashboard/sale/list']);
      });

    } catch (error: any) {
      console.error('Error al procesar la venta:', error);
      Swal.close();
      Swal.fire(
        'Venta Cancelada',
        `No se pudo registrar la venta. ${error?.error?.message || error?.message || 'Error de conexión'}`,
        'error'
      );
    }
  }

  filterProducts(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredProductoAlmacen = [...this.products];
    } else {
      this.filteredProductoAlmacen = this.products.filter((p) =>
        p.producto?.nombre?.toLowerCase().includes(query)
      );
    }
    this.cdr.markForCheck();
  }

  goBack(): void {
    this.router.navigate(['/dashboard/sale/list']);
  }
}
