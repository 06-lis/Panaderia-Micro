import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RecipeService } from '../service/recipe.service';
import { ItemService } from '../../crear-item/service/item.service';
import { Receta } from '../../../interfaces/recipe.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipeListComponent implements OnInit {
  recipes: Receta[] = [];
  insumos: any[] = [];
  itemsMap = new Map<number, string>();
  loading = false;
  saving = false;
  searchTerm = '';
  selectedRecipe: Receta | null = null;
  showDetailsModal = false;
  isEditing = false;
  editForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
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
        this.insumos = items.filter(i => i.tipo === 'Insumo');
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
    this.isEditing = false;
    this.cdr.markForCheck();
  }

  // Edit Logic
  startEdit(recipe: Receta = this.selectedRecipe!): void {
    if (!recipe) return;
    this.selectedRecipe = recipe;
    this.isEditing = true;
    this.showDetailsModal = true;

    this.editForm = this.fb.group({
      cantidadRequerida: [recipe.cantidadRequerida, [Validators.required, Validators.min(1)]],
      detalles: this.fb.array(
        (recipe.detalles || []).map(d => {
          const nombreInsumo = this.itemsMap.get(d.insumoId) || `Insumo #${d.insumoId}`;
          return this.fb.group({
            id: [d.id],
            insumoId: [d.insumoId, Validators.required],
            searchCtrl: [nombreInsumo],
            suggestions: [[]],
            cantidadRequerida: [d.cantidadRequerida, [Validators.required, Validators.min(1)]]
          });
        })
      )
    });
    this.cdr.markForCheck();
  }

  get detallesFormArray(): FormArray {
    return this.editForm.get('detalles') as FormArray;
  }

  addDetalle(): void {
    this.detallesFormArray.push(this.fb.group({
      id: [0],
      insumoId: [null, Validators.required],
      searchCtrl: [''],
      suggestions: [[]],
      cantidadRequerida: [1, [Validators.required, Validators.min(1)]]
    }));
    this.cdr.markForCheck();
  }

  filterInsumo(index: number, event: any): void {
    const query = (event?.target?.value || '').toLowerCase();
    const group = this.detallesFormArray.at(index) as FormGroup;

    const suggestions = this.insumos.filter(i => 
      (i.nombre || i.nombreProducto || '').toLowerCase().includes(query) || 
      (i.id || i.itemId || '').toString().includes(query)
    );
    group.patchValue({ suggestions });
    this.cdr.markForCheck();
  }

  selectInsumo(index: number, item: any): void {
    const group = this.detallesFormArray.at(index) as FormGroup;
    group.patchValue({
      insumoId: item.id || item.itemId,
      searchCtrl: item.nombre || item.nombreProducto,
      suggestions: []
    });
    this.cdr.markForCheck();
  }

  removeDetalle(index: number): void {
    this.detallesFormArray.removeAt(index);
    this.cdr.markForCheck();
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.cdr.markForCheck();
  }

  saveEdit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    
    if (this.detallesFormArray.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Formulario Inválido',
        text: 'Debes añadir al menos un insumo.',
        confirmButtonColor: '#3E261A'
      });
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();

    const formValue = this.editForm.value;
    const payload: Receta = {
      ...this.selectedRecipe!,
      cantidadRequerida: Number(formValue.cantidadRequerida),
      detalles: formValue.detalles.map((d: any) => ({
        id: d.id,
        recetaId: this.selectedRecipe!.id,
        insumoId: Number(d.insumoId),
        cantidadRequerida: Number(d.cantidadRequerida)
      }))
    };

    this.recipeService.updateRecipe(payload.id!, payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Receta Actualizada!',
          text: 'Los cambios se han guardado correctamente.',
          confirmButtonColor: '#8E4E2A'
        });
        this.saving = false;
        this.closeDetails();
        this.loadData(); // Recargar datos
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err || 'No se pudo actualizar la receta.',
          confirmButtonColor: '#3E261A'
        });
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
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
