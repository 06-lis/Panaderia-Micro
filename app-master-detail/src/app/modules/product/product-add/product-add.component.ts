import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Category } from '../../../interfaces/category.interface';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductService } from '../service/product.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../category/service/category.service';

@Component({
  selector: 'app-product-add',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  template: `
    <div
  class="max-w-lg mx-auto mt-10 p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-blue-500/30"
>
  <h2
    class="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-blue-400 via-blue-600 to-cyan-500 bg-clip-text text-transparent drop-shadow-lg"
  >
    🚀 Crear Producto
  </h2>

  <form [formGroup]="productForm" (ngSubmit)="createProduct()" class="space-y-6">
    <!-- Nombre del Producto -->
    <div>
      <label for="nombre" class="block text-sm font-semibold text-gray-300">
        📌 Nombre del producto
      </label>
      <input
        type="text"
        id="nombre"
        formControlName="nombre"
        placeholder="Ejemplo: Laptop Gamer"
        class="w-full px-4 py-3 mt-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition hover:border-cyan-400 focus:shadow-cyan-500/50"
      />
      <div
        *ngIf="productForm.get('nombre')?.invalid && productForm.get('nombre')?.touched"
        class="mt-1 text-red-400 text-sm flex items-center"
      >
        ⚠️ El nombre es requerido (máx. 30 caracteres).
      </div>
    </div>

    <!-- Precio del Producto -->
    <div>
      <label for="precio" class="block text-sm font-semibold text-gray-300">
        💰 Precio del producto
      </label>
      <input
        type="number"
        id="precio"
        formControlName="precio"
        placeholder="Ejemplo: 199.99"
        class="w-full px-4 py-3 mt-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition hover:border-cyan-400 focus:shadow-cyan-500/50"
      />
      <div
        *ngIf="productForm.get('precio')?.invalid && productForm.get('precio')?.touched"
        class="mt-1 text-red-400 text-sm flex items-center"
      >
        ⚠️ El precio debe ser mayor a 0.
      </div>
    </div>

    <!-- Categoría del Producto -->
    <div>
      <label for="id_categoria" class="block text-sm font-semibold text-gray-300">
        📦 Categoría
      </label>
      <select
        id="id_categoria"
        formControlName="id_categoria"
        class="w-full px-4 py-3 mt-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition hover:border-cyan-400 focus:shadow-cyan-500/50"
      >
        <option value="" disabled selected>Seleccione una categoría</option>
        <option value="1">Electrónica</option>
        <option value="2">Hogar</option>
        <option value="3">Ropa</option>
        <option value="4">Accesorios</option>
      </select>
      <div
        *ngIf="productForm.get('id_categoria')?.invalid && productForm.get('id_categoria')?.touched"
        class="mt-1 text-red-400 text-sm flex items-center"
      >
        ⚠️ Seleccione una categoría.
      </div>
    </div>

    <!-- Botón -->
    <button
      type="submit"
      class="w-full py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white font-bold rounded-lg hover:scale-105 hover:shadow-cyan-500/50 hover:shadow-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      [disabled]="productForm.invalid"
    >
      ➕ Agregar Producto
    </button>
  </form>
</div>

  `,
  styleUrl: './product-add.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductAddComponent implements OnInit {
  @Input() category: Category[] = [];
  productForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.productForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(30)]],
      precio: [
        0,
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')

        ],
      ], // Asegura que el precio sea un número entero
      id_categoria: [null, [Validators.required]], // Selección de categoría
    });
    this.loadCategories();
    // throw new Error('Method not implemented.');
  }

  loadCategories(): void {
    this.categoryService.getCategoryAll().subscribe(
      (data) => {
        this.category = data;
        console.log('Categorias cargadas:', this.category);
        // this.errorMessage = null
        this.cdr.markForCheck();
      },
      (error) => {
        // this.errorMessage = 'Hubo un error al cargar las categorias';
        this.cdr.markForCheck();
      }
    );
  }
  // Método para enviar los datos del formulario
  createProduct(): void {
    if (this.productForm.valid) {
      const product = this.productForm.value;
      console.log('data para crear un producto:', product);

      this.productService.createProduct(product).subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Producto creado',
            text: 'El producto se ha creado exitosamente.',
            confirmButtonText: 'OK',
          }).then(() => {
            this.router
              .navigateByUrl('/', { skipLocationChange: true })
              .then(() => {
                this.router.navigate(['/dashboard/product/list']); // Navega a la lista de productos
              });
          });
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al crear el producto. Inténtalo de nuevo.',
            confirmButtonText: 'OK',
          });
        },
      });
    } else {
      console.log('Formulario inválido');
    }
  }
}
