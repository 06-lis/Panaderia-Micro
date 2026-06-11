import { ChangeDetectionStrategy, Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { RecipeService } from '../service/recipe.service';
import { ItemService } from '../../crear-item/service/item.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recipe-form.component.html',
  styleUrl: './recipe-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipeFormComponent implements OnInit {
  @Output() saved = new EventEmitter<void>();

  recipeForm!: FormGroup;
  productos: any[] = [];
  insumos: any[] = [];
  loadingItems = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private recipeService: RecipeService,
    private itemService: ItemService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.recipeForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(250)]],
      productoId: [null, Validators.required],
      cantidadRequerida: [1, [Validators.required, Validators.min(1)]],
      detalles: this.fb.array([])
    });

    this.agregarInsumo();
    this.loadItems();
  }

  loadItems(): void {
    this.loadingItems = true;
    this.cdr.markForCheck();

    this.itemService.getItems().subscribe({
      next: (items) => {
        this.productos = items.filter(i => i.tipo === 'Producto');
        this.insumos = items.filter(i => i.tipo === 'Insumo');
        this.loadingItems = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar items para formulario:', err);
        this.loadingItems = false;
        this.cdr.markForCheck();
      }
    });
  }

  get detallesFormArray(): FormArray {
    return this.recipeForm.get('detalles') as FormArray;
  }

  crearDetalleGroup(): FormGroup {
    return this.fb.group({
      insumoId: [null, Validators.required],
      cantidadRequerida: [1, [Validators.required, Validators.min(1)]]
    });
  }

  agregarInsumo(): void {
    this.detallesFormArray.push(this.crearDetalleGroup());
    this.cdr.markForCheck();
  }

  eliminarInsumo(index: number): void {
    if (this.detallesFormArray.length > 1) {
      this.detallesFormArray.removeAt(index);
    } else {
      this.detallesFormArray.at(0).reset({ insumoId: null, cantidadRequerida: 1 });
    }
    this.cdr.markForCheck();
  }

  isInsumoSeleccionado(insumoId: number, currentIndex: number): boolean {
    const selected = this.detallesFormArray.value as { insumoId: any }[];
    return selected.some((v, idx) => v.insumoId && Number(v.insumoId) === Number(insumoId) && idx !== currentIndex);
  }

  onSubmit(): void {
    if (this.recipeForm.invalid) {
      this.recipeForm.markAllAsTouched();
      return;
    }

    const val = this.recipeForm.value;
    if (val.detalles.length === 0 || val.detalles.some((d: any) => !d.insumoId)) {
      Swal.fire({
        icon: 'error',
        title: 'Formulario Inválido',
        text: 'Debes añadir al menos un ingrediente/insumo válido.',
        confirmButtonColor: '#3E261A'
      });
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();

    const payload = {
      nombre: val.nombre,
      descripcion: val.descripcion,
      productoId: Number(val.productoId),
      cantidadRequerida: Number(val.cantidadRequerida),
      detalles: val.detalles.map((d: any) => ({
        insumoId: Number(d.insumoId),
        cantidadRequerida: Number(d.cantidadRequerida)
      }))
    };

    this.recipeService.createRecipe(payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Receta Creada!',
          text: `La receta "${payload.nombre}" se registró correctamente.`,
          confirmButtonColor: '#8E4E2A'
        });
        this.saved.emit();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al Guardar',
          text: err || 'No se pudo crear la receta. Verifica la conexión o los campos.',
          confirmButtonColor: '#3E261A'
        });
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }
}
