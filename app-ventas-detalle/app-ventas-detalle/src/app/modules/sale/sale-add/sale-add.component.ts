import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
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
// import { EmailService } from '../../../shared/components/email-form/email.service';

import { ProductoAlmacen } from '../../../interfaces/producto-almacen,interface,';
import { ProductoAlmacenService } from '../../product/service/productoAlmacen.service';
import { CartVenta } from '../../../interfaces/detalle-venta.inteface';
import { Almacen } from '../../../interfaces/almacen.interface';
import { User } from '../../../interfaces/user.interface';
import { Venta } from '../../../interfaces/venta.interface';

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
export class SaleAddComponent {
  user:User | undefined;
  customers :Customer[]=[]; // Lista simulada de clientes
  selectedCustomerId: number | null = null;
  selectedCustome: Customer | null = null;
  cartItems: CartVenta[] = [];
  searchQuery: string = ''; // Texto de búsqueda
  filteredProductoAlmacen: ProductoAlmacen[] = []; // Productos filtrados

  //saleDetails: SaleDetail[] = [];
  totalAmount: number = 0;
  products: ProductoAlmacen[] = [];
  saleDetails: SaleDetail[] = [];

  newProduct: Partial<SaleDetail> = { productId: undefined, salePrice: undefined, quantity: undefined };

  saleData: any = {
    customerName: 'Ayelen Romina Quinteros Siles',
    date: '2025-01-17',
    customerEmail: 'ayelenquinteros496@gmail.com',
    items: [
      { productName: 'Producto A', quantity: 1, price: 100 },
      { productName: 'Producto B', quantity: 2, price: 150 },
    ],
    total: 400,
  };

  constructor(
      private salesService: SaleService,
      private customerService: CustomerService,
      private productService:ProductService,
      private productoAlmacenService:ProductoAlmacenService,
      private router: Router, // Inyectar Router
      private cdr: ChangeDetectorRef,


    ) {}
  ngOnInit(): void {
    const user = JSON.parse(sessionStorage.getItem('user') || '[]');
    this.user = user;
    this.productoAlmacenService.getProductoAlmacenAll().subscribe(
      (data)=>{
        this.products = data;
        this.filteredProductoAlmacen =data;
        console.log('Productos Almacenes  cargados:', this.products);
        this.cdr.markForCheck();
      }
    );
    this.customerService.getCustomerAll().subscribe(
      (data) => {
        this.customers = data;
        console.log('Clientes cargados:', this.customers);
        //this.errorMessage = null;
        this.cdr.markForCheck();
      });

      this.filteredProductoAlmacen = this.products; // Inicialmente todos los productos
  }


  addToCart(productoAlmacen:ProductoAlmacen): void {
    console.log('Añadiendo al carrito:', productoAlmacen);
    // const productId: number | undefined = product.productoId;
    const productoAlmacenId: number = productoAlmacen.id!;
    const monto: number = productoAlmacen.producto?.precio!;
    const cantidad: number  = 1;
    const producto: Product | undefined = productoAlmacen.producto;
    const almacen: Almacen | undefined = productoAlmacen.almacen;

      const detalleventa: CartVenta = {
        productoAlmacenId: productoAlmacenId,
        cantidad: cantidad,
        monto: monto,
        producto: producto!,
        alamacen: almacen!
      };


    if (productoAlmacen.stock !== undefined) {
      productoAlmacen.stock -= 1;
    }

    const existingItem = this.cartItems.find(item => item.productoAlmacenId === productoAlmacenId);
    console.log('existingItem:', existingItem);
    if (existingItem) {
      // Si el producto ya está en el carrito, incrementamos la cantidad
      if (existingItem.cantidad !== undefined) {
        existingItem.cantidad += cantidad;
      }
    } else {
      // Si no está, lo añadimos como un nuevo producto
      console.log('Añadiendo producto al carrito:', productoAlmacenId, monto, cantidad);
      if (productoAlmacenId !== undefined && monto !== undefined && cantidad !== undefined && producto!== undefined && almacen!== undefined) {
         this.cartItems.push(detalleventa);
      }
    }
    this.updateTotalAmount();
    console.log("this.cartItems",this.cartItems);
  }

  addProduct(): void {
    if (this.newProduct.productId && this.newProduct.salePrice && this.newProduct.quantity) {
      this.saleDetails.push({
        productId: this.newProduct.productId,
        salePrice: this.newProduct.salePrice,
        quantity: this.newProduct.quantity,
      } as SaleDetail);
      this.updateTotalAmount();
      this.newProduct = { productId: undefined, salePrice: undefined, quantity: undefined };
    }
  }

  removeItem(index: number): void {
    const item = this.cartItems[index];

    if (!item) {
      console.warn('El índice no es válido');
      return;
    }

    console.log('Eliminando item:', item);
     const itemProduct = this.products.find(product => product.id === item.productoAlmacenId);
     console.log('Producto encontrado:', itemProduct);
     if (itemProduct) {
      itemProduct.stock = (itemProduct.stock ?? 0) + (item.cantidad ?? 0);
      //  itemProduct.stock = itemProduct.stock? + item.cantidad! : 0;
     }
     this.cartItems.splice(index, 1);
     this.updateTotalAmount();
  }

  updateTotalAmount(): void {
    this.totalAmount = this.cartItems.reduce(
      (total, detail) => total + (detail.cantidad ?? 0) * (detail.producto?.precio ?? 0),
      0
    );
  }


  async createSale() {
    if (this.selectedCustome && this.cartItems.length > 0) {
      const ventaData: Venta = {
        fecha: new Date().toISOString().substring(0, 10), // Solo la fecha (YYYY-MM-DD)
        clienteId: this.selectedCustome.id!,
        usuarioId: this.user?.userId!,
      };

      console.log('Datos de venta:', ventaData);

      try {
        // Crear la venta
        const response = await this.salesService.createSale(ventaData).toPromise();
        console.log('Venta creada exitosamente:', response);

        if (response && response.id) {
          // Insertar los detalles de venta
          for (let detalle of this.cartItems) {
            const detalleVenta = {
              productoAlmacenId: detalle.productoAlmacenId,
              ventaId: response.id, // Asegurándote de que 'response.id' existe
              cantidad: detalle.cantidad!,
              monto: detalle.monto! * detalle.cantidad!, // Calculando el monto total
            };

            // Crear el detalle de la venta
            try {
              const detalleResponse = await this.salesService.createDetalleVenta(detalleVenta).toPromise();
              console.log('Detalle de venta insertado:', detalleResponse);
            } catch (detalleError) {
              console.error('Error al insertar detalle de venta:', detalleError);
            }
          }

          // Redirigir a la lista de ventas después de todo el proceso
          alert('Venta creada con éxito!');
          this.router.navigate(['/dashboard/sale/list']); // Redirige después de todo
        }
      } catch (error) {
        console.error('Error al crear la venta:', error);
        alert('Error al crear la venta.');
      }
    } else {
      alert('Please select a customer and add at least one product.');
    }
  }

  resetForm(): void {
    this.selectedCustomerId = null;
    this.saleDetails = [];
    this.totalAmount = 0;
  }

  eliminarDelCarrito(id: number) {
    this.saleDetails = this.saleDetails.filter(item => item.saleDetailId !== id);
  }

  vaciarCarrito() {
    this.saleDetails = [];
  }

  filterProducts(): void {
    const query = this.searchQuery.toLowerCase(); // Convertir a minúsculas
    this.filteredProductoAlmacen = this.products.filter((product) =>
      product.producto?.nombre?.toLowerCase().includes(query)
    );
  }

  // Método para volver
  goBack(): void {
    this.router.navigate(['/dashboard/sale/list']); // Cambia '/list' a la ruta a la que quieres volver
  }








  async onSubmit() {
    // try {
    //   const pdfBlob = await this.pdfService.generateSalePdf(this.saleData);
    //   console.log(pdfBlob);
    //   const formData = this.createEmailFormData(pdfBlob,"askdjals");
    //   this.sendEmail(formData);
    // } catch (error) {
    //   console.error('Error al generar o enviar el PDF:', error);
    // }
  }

  private createEmailFormData(pdfBlob: Blob,customerName:string): FormData {
    const formData = new FormData();
    formData.append('Para', customerName);
    formData.append('Asunto', 'Factura de Venta');
    formData.append('Contenido', 'Adjunto encontrará su factura.');
    formData.append('files', pdfBlob, 'factura.pdf');
    return formData;
  }

  private sendEmail(formData: FormData) {
    // this.emailService.sendEmail(formData).subscribe({
    //   next: (response) => {
    //     console.log('Correo enviado con éxito:', response);
    //   },
    //   error: (error) => {
    //     console.error('Error al enviar el correo:', error);
    //   },
    // });
  }

 }
