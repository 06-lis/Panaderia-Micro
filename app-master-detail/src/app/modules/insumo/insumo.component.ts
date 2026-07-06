import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ItemService } from '../crear-item/service/item.service';
import { CategoryService } from '../category/service/category.service';
import { Category } from '../../interfaces/category.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-insumo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './insumo.component.html',
  styleUrl: './insumo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InsumoComponent implements OnInit {
  insumos: any[] = [];
  categories: Category[] = [];
  insumoForm!: FormGroup;
  isEditing = false;
  editingInsumoId: number | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Formulario para editar
    this.insumoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      unidadMedida: ['', [Validators.required, Validators.maxLength(20)]],
      categoriaId: [null, [Validators.required]],
      tipo: ['Insumo']
    });

    this.loadInsumos();
    this.loadCategories();
  }

  loadInsumos(): void {
    this.itemService.getItems().subscribe({
      next: (items) => {
        // Filtrar solo los items que son del tipo 'Insumo'
        this.insumos = items.filter(item => item.tipo && item.tipo.toLowerCase() === 'insumo');
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Hubo un error al cargar los insumos';
        this.cdr.markForCheck();
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategoryAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.cdr.markForCheck();
      }
    });
  }

  openEditModal(insumo: any): void {
    this.isEditing = true;
    this.editingInsumoId = insumo.id;
    this.insumoForm.patchValue({
      nombre: insumo.nombre,
      precio: insumo.precio,
      unidadMedida: insumo.unidadMedida,
      categoriaId: insumo.categoriaId || (insumo.categoria ? (insumo.categoria.id || insumo.categoria.idCategoria) : null),
      tipo: 'Insumo'
    });
    this.cdr.markForCheck();
  }

  closeEditModal(): void {
    this.isEditing = false;
    this.editingInsumoId = null;
    this.insumoForm.reset({ tipo: 'Insumo' });
    this.cdr.markForCheck();
  }

  saveInsumo(): void {
    if (this.insumoForm.invalid || this.editingInsumoId === null) {
      this.insumoForm.markAllAsTouched();
      return;
    }

    const insumoData = this.insumoForm.value;
    if (insumoData.categoriaId) {
      insumoData.categoriaId = Number(insumoData.categoriaId);
    }

    this.itemService.updateItem(this.editingInsumoId, insumoData).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Insumo Actualizado',
          text: 'El insumo se ha modificado exitosamente.',
          confirmButtonColor: '#8E4E2A'
        }).then(() => {
          this.closeEditModal();
          this.loadInsumos();
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el insumo.',
          confirmButtonColor: '#3E261A'
        });
      }
    });
  }

  deleteInsumo(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8E4E2A',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.itemService.deleteItem(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Eliminado!',
              text: 'El insumo ha sido eliminado correctamente.',
              confirmButtonColor: '#8E4E2A'
            }).then(() => {
              this.loadInsumos();
            });
          },
          error: (err) => {
            console.error(err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el insumo. Es posible que esté asociado a una receta.',
              confirmButtonColor: '#3E261A'
            });
          }
        });
      }
    });
  }
}
