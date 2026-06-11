import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeService } from '../service/recipe.service';
import { ItemService } from '../../crear-item/service/item.service';
import { Receta } from '../../../interfaces/recipe.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipeListComponent implements OnInit {
  recipes: Receta[] = [];
  itemsMap = new Map<number, string>();
  loading = false;
  searchTerm = '';
  selectedRecipe: Receta | null = null;
  showDetailsModal = false;

  constructor(
    private recipeService: RecipeService,
    private itemService: ItemService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.itemService.getItems().subscribe({
      next: (items) => {
        this.itemsMap.clear();
        items.forEach(item => {
          this.itemsMap.set(item.id || item.itemId, item.nombre || item.nombreProducto);
        });
        
        this.loadRecipes();
      },
      error: (err) => {
        console.error('Error al cargar items:', err);
        this.loadRecipes();
      }
    });
  }

  loadRecipes(): void {
    this.recipeService.getRecipes().subscribe({
      next: (data) => {
        this.recipes = data.map(recipe => ({
          ...recipe,
          nombreProducto: this.itemsMap.get(recipe.productoId) || `Producto #${recipe.productoId}`,
          detalles: (recipe.detalles || []).map(d => ({
            ...d,
            nombreInsumo: this.itemsMap.get(d.insumoId) || `Insumo #${d.insumoId}`
          }))
        }));
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar recetas:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get filteredRecipes(): Receta[] {
    if (!this.searchTerm.trim()) return this.recipes;
    const term = this.searchTerm.toLowerCase();
    return this.recipes.filter(r => 
      r.nombre.toLowerCase().includes(term) || 
      (r.nombreProducto && r.nombreProducto.toLowerCase().includes(term)) ||
      r.descripcion.toLowerCase().includes(term)
    );
  }

  openDetails(recipe: Receta): void {
    this.selectedRecipe = recipe;
    this.showDetailsModal = true;
    this.cdr.markForCheck();
  }

  closeDetails(): void {
    this.selectedRecipe = null;
    this.showDetailsModal = false;
    this.cdr.markForCheck();
  }

  deleteRecipe(recipe: Receta): void {
    if (!recipe.id) return;

    Swal.fire({
      title: '¿Eliminar Receta?',
      text: `¿Estás seguro de eliminar la receta "${recipe.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3E261A',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.recipeService.deleteRecipe(recipe.id!).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Eliminado!',
              text: 'La receta ha sido eliminada correctamente.',
              icon: 'success',
              confirmButtonColor: '#8E4E2A'
            });
            this.loadData();
          },
          error: (err) => {
            Swal.fire({
              title: 'Error',
              text: err || 'No se pudo eliminar la receta.',
              icon: 'error',
              confirmButtonColor: '#3E261A'
            });
          }
        });
      }
    });
  }
}
