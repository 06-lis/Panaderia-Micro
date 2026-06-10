import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CategoryService } from '../category/service/category.service';
import { ItemService } from './service/item.service';
import { Category } from '../../interfaces/category.interface';

@Component({
  selector: 'app-crear-item',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './crear-item.component.html',
  styleUrl: './crear-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrearItemComponent implements OnInit {
  itemForm!: FormGroup;
  categoryForm!: FormGroup;
  categories: Category[] = [];
  errorMessage: string | null = null;
  categoryErrorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private itemService: ItemService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Formulario para crear un Item (Producto o Insumo)
    this.itemForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      tipo: ['Producto', [Validators.required]],
      unidadMedida: ['', [Validators.required, Validators.maxLength(20)]],
      categoriaId: [null, [Validators.required]],
      imagen: [''] // Solo se valida/requiere si tipo == 'Producto'
    });

    // Formulario para crear una Categoría rápida
    this.categoryForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]]
    });

    // Cargar las categorías existentes
    this.loadCategories();

    // Cambiar la validación del campo de imagen dinámicamente según el tipo de item
    this.itemForm.get('tipo')?.valueChanges.subscribe(value => {
      const imagenControl = this.itemForm.get('imagen');
      if (value === 'Producto') {
        imagenControl?.setValidators([Validators.required]);
      } else {
        imagenControl?.clearValidators();
      }
      imagenControl?.updateValueAndValidity();
      this.cdr.markForCheck();
    });

    // Establecer validación de imagen inicial puesto que por defecto es 'Producto'
    this.itemForm.get('imagen')?.setValidators([Validators.required]);
    this.itemForm.get('imagen')?.updateValueAndValidity();
  }

  loadCategories(): void {
    this.categoryService.getCategoryAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar las categorías.';
        this.cdr.markForCheck();
      }
    });
  }

  onSubmitItem(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const itemData = this.itemForm.value;
    // Asegurar que si es insumo, la imagen vaya vacía o nula
    if (itemData.tipo === 'Insumo') {
      itemData.imagen = '';
    }

    // Convertir el CategoriaId a número
    if (itemData.categoriaId) {
      itemData.categoriaId = Number(itemData.categoriaId);
    }

    this.itemService.createItem(itemData).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: '¡Item Creado!',
          text: `El ${itemData.tipo.toLowerCase()} se ha registrado exitosamente.`,
          confirmButtonColor: '#8E4E2A'
        }).then(() => {
          // Redirigir a la lista adecuada según el tipo creado
          if (itemData.tipo === 'Producto') {
            this.router.navigate(['/dashboard/product/list']);
          } else {
            this.router.navigate(['/dashboard/insumo']);
          }
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear el item. Verifica los datos o el servidor.',
          confirmButtonColor: '#3E261A'
        });
      }
    });
  }

  onSubmitCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const categoryData = this.categoryForm.value;
    this.categoryService.createCategory(categoryData).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Categoría Creada',
          text: `La categoría "${categoryData.nombre}" se creó correctamente.`,
          confirmButtonColor: '#8E4E2A'
        });
        this.categoryForm.reset();
        // Recargar categorías y seleccionar la nueva categoría automáticamente si es posible
        this.categoryService.getCategoryAll().subscribe({
          next: (data) => {
            this.categories = data;
            // Intentar buscar la nueva categoría en la lista recién cargada para seleccionarla
            const newCat = data.find(c => c.nombre.toLowerCase() === categoryData.nombre.toLowerCase());
            if (newCat) {
              this.itemForm.get('categoriaId')?.setValue(newCat.id || newCat.idCategoria);
            }
            this.cdr.markForCheck();
          }
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear la categoría.',
          confirmButtonColor: '#3E261A'
        });
      }
    });
  }
}
