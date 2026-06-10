import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Product } from '../../interfaces/poduct.interface';
import { Category } from '../../interfaces/category.interface';
import { ProductService } from './service/product.service';
import { CategoryService } from '../category/service/category.service';
import { ProductAddComponent } from "./product-add/product-add.component";
import { ProductListComponent } from "./product-list/product-list.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-product',
  imports: [
    ProductListComponent,
    FormsModule,
    ReactiveFormsModule
],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductComponent implements OnInit {
  title = 'Curso de angular';
  errorMessage: string | null = null;


  parentMessage: string = 'Hola desde el Padre';
  products: Product[] = [];
  categories: Category[]=[];

  constructor(
    private productService:ProductService,
    private categoryService:CategoryService,
    private cdr: ChangeDetectorRef
  ){}
  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts():void{
    this.productService.getProductAll().subscribe(
      (data) => {
        this.products = data;
        console.log('Clientes cargados:', this.products);
        this.errorMessage = null;
        this.cdr.markForCheck();
      },
      (error) => {
        this.errorMessage = 'Hubo un error al cargar los productos';
        this.cdr.markForCheck();
      }
    );
  }

  loadCategories():void{
    this.categoryService.getCategoryAll().subscribe(
      (data) => {
        this.categories = data;
        console.log('Categorias cargadas:', this.categories);
        this.errorMessage = null
        this.cdr.markForCheck();;
      },
      (error) => {
        this.errorMessage = 'Hubo un error al cargar las categorias';
        this.cdr.markForCheck();
      }
    );
  }

}
