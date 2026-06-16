import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InventarioService } from '../service/inventario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfiguracionComponent implements OnInit {
  configForm!: FormGroup;
  loading = false;
  saving = false;

  constructor(
    private inventarioService: InventarioService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.configForm = this.fb.group({
      metodoValuacionPorDefecto: ['FIFO', Validators.required],
      diasNotificacionVencimiento: [30, [Validators.required, Validators.min(1)]],
      permitirStockNegativo: [false],
      notificarStockBajo: [true],
      nivelStockBajo: [10, [Validators.required, Validators.min(1)]],
      diasPorDefectoVencimiento: [365, Validators.required]
    });

    this.loadConfiguracion();
  }

  loadConfiguracion() {
    this.loading = true;
    this.cdr.markForCheck();
    this.inventarioService.getConfiguracion().subscribe({
      next: (data) => {
        if (data && Object.keys(data).length > 0) {
          this.configForm.patchValue({
            metodoValuacionPorDefecto: data.metodo_valuacion_por_defecto || 'FIFO',
            diasNotificacionVencimiento: data.dias_notificacion_vencimiento || 30,
            permitirStockNegativo: data.permitir_stock_negativo || false,
            notificarStockBajo: data.notificar_stock_bajo || true,
            nivelStockBajo: data.nivel_stock_bajo || 10,
            diasPorDefectoVencimiento: data.dias_por_defecto_vencimiento || 365
          });
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando configuración:', err);
        // Si no existe, usamos los valores por defecto
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSubmit() {
    if (this.configForm.invalid) {
      this.configForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();

    // Map form to DB fields
    const payload = {
      metodo_valuacion_por_defecto: this.configForm.value.metodoValuacionPorDefecto,
      dias_notificacion_vencimiento: this.configForm.value.diasNotificacionVencimiento,
      permitir_stock_negativo: this.configForm.value.permitirStockNegativo,
      notificar_stock_bajo: this.configForm.value.notificarStockBajo,
      nivel_stock_bajo: this.configForm.value.nivelStockBajo,
      dias_por_defecto_vencimiento: this.configForm.value.diasPorDefectoVencimiento
    };

    this.inventarioService.updateConfiguracion(payload).subscribe({
      next: () => {
        Swal.fire('Guardado', 'Configuración de inventario actualizada', 'success');
        this.saving = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        Swal.fire('Error', err, 'error');
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }
}
