import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { Product } from '../../../interfaces/poduct.interface';
import { ProductService } from '../service/product.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-product-list',
  imports: [
    CommonModule
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  @Input() public products: Product[] = [];
  message:string = '';

  constructor(
    private productService:ProductService,
    private cdr: ChangeDetectorRef,
    private router:Router
  ){}

  deleteProduct(product_id:number):void{
    this.productService.deleteProduct(product_id).subscribe(
      {
        next: (responce) => {
          Swal.fire({
            icon: 'success',
            title: '¡Eliminado!',
            text: 'Producto eliminado correctamente.',
            confirmButtonText: 'OK',
          }).then(() => {
            // Recargar la lista de productos
            this.reloadProducts();
          });
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err,
            confirmButtonText: 'Entendido',
          });
          this.cdr.markForCheck();
        }
      }
    );
  }

  reloadProducts(): void {
    this.productService.getProductAll().subscribe({
      next: (products) => {
        this.products = products; // Actualiza la lista de productos
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.cdr.markForCheck();
      }
    });
  }

  agregarProducto(){
    this.router.navigate(['/dashboard/product/add']);
  }
}
