import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Category } from '../../../interfaces/category.interface';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../service/category.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-category-list',
  imports: [
    CommonModule
  ],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryListComponent implements OnInit{

  constructor(
    private categoriaService:CategoryService,
    private cdr: ChangeDetectorRef,
    private router: Router // Inyectar el router
  ){}
  ngOnInit(): void {
    this.loadCategoira();
  }
  @Input() public categories: Category[] = [];
  loadCategoira():void{
    this.categoriaService.getCategoryAll().subscribe(
      (data) => {
        this.categories = data;
        console.log('Categorias cargadas:',this.categories);
        this.cdr.markForCheck();
      }
    );
  }

  editCategory(id: number): void {
    const category = this.categories.find(c => c.id === id);
    if (!category) return;

    Swal.fire({
      title: 'Editar Categoría',
      input: 'text',
      inputValue: category.nombre,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return '¡Necesitas escribir un nombre!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoriaService.updateCategory(id, { id, nombre: result.value }).subscribe({
          next: () => {
            Swal.fire('¡Actualizado!', 'La categoría ha sido actualizada.', 'success');
            this.loadCategoira();
          },
          error: (err) => {
            Swal.fire('Error', 'No se pudo actualizar la categoría.', 'error');
            console.error(err);
          }
        });
      }
    });
  }

  deleteCategory(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoriaService.deleteCategory(id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'La categoría ha sido eliminada.', 'success');
            this.loadCategoira();
          },
          error: (err) => {
            Swal.fire('Error', 'No se pudo eliminar la categoría. Es posible que esté en uso.', 'error');
            console.error(err);
          }
        });
      }
    });
  }
}
