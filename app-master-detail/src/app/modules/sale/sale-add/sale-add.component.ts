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
        });

        // Filtrado: vender únicamente items de tipo 'Producto'
        this.products = data.filter(x => x.producto?.tipo === 'Producto');
        this.filteredProductoAlmacen = [...this.products];
        console.log('Productos de Almacén cargados y filtrados:', this.products);
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
    const productoAlmacenId = productoAlmacen.id!;
    const precio = productoAlmacen.producto?.precio || 0;
    const producto = productoAlmacen.producto;
    const almacen = productoAlmacen.almacen;

    if (!producto || !almacen) {
      console.warn('Producto o almacén no válidos en el productoAlmacen seleccionado.');
      return;
    }

    if (productoAlmacen.stock <= 0) {
      Swal.fire('Sin Stock', 'No hay stock disponible para este producto.', 'warning');
      return;
    }

    const existingItem = this.cartItems.find(item => item.productoAlmacenId === productoAlmacenId);
    if (existingItem) {
      existingItem.cantidad = (existingItem.cantidad ?? 0) + 1;
    } else {
      const detalleventa: CartVenta = {
        productoAlmacenId: productoAlmacenId,
        cantidad: 1,
        monto: precio,
        producto: producto,
        alamacen: almacen
      };
      this.cartItems.push(detalleventa);
    }

    productoAlmacen.stock -= 1;
    this.updateTotalAmount();
    this.cdr.markForCheck();
  }

  incrementCartItem(index: number): void {
    const item = this.cartItems[index];
    const productInStock = this.products.find(p => p.id === item.productoAlmacenId);
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
      const productInStock = this.products.find(p => p.id === item.productoAlmacenId);
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

    const itemProduct = this.products.find(p => p.id === item.productoAlmacenId);
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

    const ventaData: Venta = {
      fecha: new Date().toISOString().substring(0, 10),
      clienteId: this.selectedCustome.id!,
      usuarioId: this.user?.userId || 1, // Fallback a usuario ID 1 si no está asignado
    };

    console.log('Enviando datos de venta al backend:', ventaData);

    try {
      // 1. Crear registro principal de Venta
      const response = await this.salesService.createSale(ventaData).toPromise();
      console.log('Venta creada en backend:', response);

      if (response && response.id) {
        const ventaId = response.id;

        // 2. Crear detalles y actualizar stock en bucle
        for (let detalle of this.cartItems) {
          const detalleVenta = {
            productoAlmacenId: detalle.productoAlmacenId,
            ventaId: ventaId,
            cantidad: detalle.cantidad!,
            monto: detalle.monto! * detalle.cantidad!,
          };

          try {
            // Guardar detalle en BD
            const detalleResponse = await this.salesService.createDetalleVenta(detalleVenta).toPromise();
            console.log('Detalle de venta creado:', detalleResponse);

            // Decrementar stock en MySQL db_ventas
            const itemId = detalle.producto.id || detalle.producto.idProducto || detalle.producto.productoId;
            const almacenId = detalle.alamacen.id;
            if (itemId && almacenId) {
              const stockResponse = await this.productoAlmacenService.updateStock(
                itemId,
                almacenId,
                -detalle.cantidad!
              ).toPromise();
              console.log('Stock actualizado:', stockResponse);
            }
          } catch (detalleError) {
            console.error('Error procesando detalle:', detalleVenta, detalleError);
          }
        }

        // Éxito
        Swal.fire({
          icon: 'success',
          title: 'Venta Registrada',
          text: 'La venta ha sido procesada y el stock ha sido actualizado correctamente.',
          confirmButtonText: 'Entendido'
        }).then(() => {
          this.router.navigate(['/dashboard/sale/list']);
        });
      } else {
        throw new Error('No se recibió el ID de la venta creada.');
      }
    } catch (error) {
      console.error('Error al procesar la venta:', error);
      Swal.fire('Error', 'No se pudo crear la venta. Por favor verifica la conexión con el microservicio.', 'error');
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
