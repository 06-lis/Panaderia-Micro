import { ChangeDetectionStrategy, Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductionService } from '../service/production.service';
import { RecipeService } from '../service/recipe.service';
import { AlmacenService } from '../../almacen/service/almacen.service';
import { EmpleadoService } from '../../usuario/empleado.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-production-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './production-form.component.html',
  styleUrl: './production-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductionFormComponent implements OnInit {
  @Output() saved = new EventEmitter<void>();

  productionForm!: FormGroup;
  recipes: any[] = [];
  almacenes: any[] = [];
  employees: any[] = [];
  loadingData = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private productionService: ProductionService,
    private recipeService: RecipeService,
    private almacenService: AlmacenService,
    private empleadoService: EmpleadoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userSession = JSON.parse(sessionStorage.getItem('user') || '{}');
    const defaultEmpId = userSession.idEmpleado ? Number(userSession.idEmpleado) : null;

    this.productionForm = this.fb.group({
      recetaId: [null, Validators.required],
      almacenId: [null, Validators.required],
      lote: [1, [Validators.required, Validators.min(1)]],
      empleadoSolicitaId: [defaultEmpId, Validators.required],
      observaciones: ['', [Validators.maxLength(200)]]
    });

    this.loadDropdowns();
  }

  loadDropdowns(): void {
    this.loadingData = true;
    this.cdr.markForCheck();

    // Load recipes
    this.recipeService.getRecipes().subscribe({
      next: (recipesData) => {
        this.recipes = recipesData;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error al cargar recetas en formulario:', err)
    });

    // Load warehouses
    this.almacenService.getAlmacenes().subscribe({
      next: (almacenesData) => {
        this.almacenes = almacenesData;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error al cargar almacenes en formulario:', err)
    });

    // Load employees
    this.empleadoService.getEmpleados().subscribe({
      next: (employeesData) => {
        this.employees = employeesData;
        this.loadingData = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar empleados en formulario:', err);
        this.loadingData = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSubmit(): void {
    if (this.productionForm.invalid) {
      this.productionForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();

    const val = this.productionForm.value;
    const payload = {
      recetaId: Number(val.recetaId),
      almacenId: Number(val.almacenId),
      lote: Number(val.lote),
      empleadoSolicitaId: Number(val.empleadoSolicitaId),
      observaciones: val.observaciones || ''
    };

    this.productionService.solicitarProduccion(payload).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: '¡Orden de Producción Creada!',
          text: `La orden de producción #${response.id} se ha registrado en estado 'pendiente' exitosamente.`,
          confirmButtonColor: '#8E4E2A'
        });
        this.saved.emit();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err || 'No se pudo registrar la solicitud de producción.',
          confirmButtonColor: '#3E261A'
        });
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }
}
