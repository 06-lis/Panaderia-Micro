import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CategoryService } from '../category/service/category.service';
import { ItemService } from './service/item.service';
import { ProductService } from '../product/service/product.service';
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

  // Variables para la imagen
  isUploading = false;
  imagePreview: string | null = null;
  isImageValid = true;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private itemService: ItemService,
    private productService: ProductService, // Importar ProductService para subir imagen
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

    // Validar imagen cuando cambia la URL manualmente
    this.itemForm.get('imagen')?.valueChanges.subscribe(url => {
      if (this.itemForm.get('tipo')?.value === 'Producto') {
        if (url && typeof url === 'string') {
          this.validateImageUrl(url);
        } else {
          this.imagePreview = null;
          this.isImageValid = true;
        }
      }
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

  // --- LÓGICA DE IMÁGENES ---

  validateImageUrl(url: string) {
    if (!url) return;
    const img = new Image();
    const finalUrl = url.startsWith('/') || url.startsWith('http') ? url : '/' + url;
    img.src = finalUrl;
    img.onload = () => {
      this.isImageValid = true;
      this.imagePreview = finalUrl;
      this.cdr.markForCheck();
    };
    img.onerror = () => {
      this.isImageValid = false;
      this.imagePreview = null;
      this.cdr.markForCheck();
    };
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      this.cdr.markForCheck();
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          this.compressImage(img, file.name);
        };
      };
      reader.readAsDataURL(file);
    }
  }

  compressImage(img: HTMLImageElement, filename: string) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Max width / height
    const MAX_WIDTH = 800;
    const MAX_HEIGHT = 800;
    let width = img.width;
    let height = img.height;

    if (width > height) {
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx?.drawImage(img, 0, 0, width, height);

    // Convertir a blob con calidad del 80%
    canvas.toBlob((blob) => {
      if (blob) {
        this.uploadImage(blob, filename);
      }
    }, 'image/jpeg', 0.8);
  }

  uploadImage(blob: Blob, filename: string) {
    this.productService.uploadImage(blob, filename).subscribe({
      next: (res) => {
        if (res && res.url) {
          this.itemForm.get('imagen')?.setValue(res.url);
          this.isUploading = false;
          Swal.fire({
            icon: 'success',
            title: 'Imagen subida',
            text: 'La imagen se ha subido y comprimido correctamente.',
            timer: 2000,
            showConfirmButton: false
          });
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        this.isUploading = false;
        this.cdr.markForCheck();
        Swal.fire('Error', 'No se pudo subir la imagen.', 'error');
      }
    });
  }

  // --- FIN LÓGICA DE IMÁGENES ---

  onSubmitItem(): void {
    if (this.itemForm.invalid || (this.itemForm.get('tipo')?.value === 'Producto' && !this.isImageValid)) {
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
