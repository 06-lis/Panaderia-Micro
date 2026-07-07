import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CategoryService } from '../../category/service/category.service';
import { ProductService } from '../service/product.service';
import { Category } from '../../../interfaces/category.interface';
import { Product } from '../../../interfaces/poduct.interface';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-edit.component.html',
  styleUrl: './product-edit.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductEditComponent implements OnInit {
  productForm!: FormGroup;
  categories: Category[] = [];
  errorMessage: string | null = null;
  productId!: number;
  isLoading = true;

  // Variables para la imagen
  isUploading = false;
  imagePreview: string | null = null;
  isImageValid = true;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));

    this.productForm = this.fb.group({
      id: [this.productId],
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      unidadMedida: ['', [Validators.required, Validators.maxLength(20)]],
      categoriaId: [null, [Validators.required]],
      imagen: ['', [Validators.required]]
    });

    // Validar imagen cuando cambia la URL manualmente
    this.productForm.get('imagen')?.valueChanges.subscribe(url => {
      if (url && typeof url === 'string') {
        this.validateImageUrl(url);
      } else {
        this.imagePreview = null;
        this.isImageValid = true;
      }
    });

    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategoryAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.loadProduct(); // Cargar el producto después de las categorías
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar las categorías.';
        this.cdr.markForCheck();
      }
    });
  }

  loadProduct(): void {
    this.productService.getProduct(this.productId).subscribe({
      next: (res) => {
        if (res && res.data) {
          const product = res.data;
          this.productForm.patchValue({
            nombre: product.nombre,
            precio: product.precio,
            unidadMedida: product.unidadMedida,
            categoriaId: product.categoriaId,
            imagen: product.imagen
          });
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar el producto.';
        this.isLoading = false;
        this.cdr.markForCheck();
        Swal.fire('Error', 'No se pudo cargar la información del producto.', 'error');
        this.router.navigate(['/dashboard/items']);
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
          this.productForm.get('imagen')?.setValue(res.url);
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

  onSubmit(): void {
    if (this.productForm.invalid || !this.isImageValid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const productData: Product = {
      ...this.productForm.value,
      categoriaId: Number(this.productForm.value.categoriaId),
      tipo: 'Producto'
    };

    this.productService.updateProduct(this.productId, productData).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'El producto se ha actualizado exitosamente.',
          confirmButtonColor: '#8E4E2A'
        }).then(() => {
          this.router.navigate(['/dashboard/items']);
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el producto.',
          confirmButtonColor: '#3E261A'
        });
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/items']);
  }
}
