import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InventarioService } from '../service/inventario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-traspasos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './traspasos.component.html',
  styleUrl: './traspasos.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraspasosComponent implements OnInit {
  traspasos: any[] = [];
  traspasoForm!: FormGroup;
  loading = false;
  saving = false;
  lotesDisponibles: any[] = [];
  almacenes: any[] = []; // In a real app we would inject AlmacenService here or load it

  constructor(
    private inventarioService: InventarioService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const userSession = JSON.parse(sessionStorage.getItem('user') || '{}');
    const defaultEmpId = userSession.idEmpleado ? Number(userSession.idEmpleado) : 1;

    this.traspasoForm = this.fb.group({
      loteId: [null, Validators.required],
      almacenOrigenId: [null, Validators.required],
      almacenDestinoId: [null, Validators.required],
      cantidad: [0, [Validators.required, Validators.min(0.01)]],
      motivo: ['', Validators.required],
      usuarioSolicitaId: [defaultEmpId, Validators.required]
    });

    this.loadTraspasos();
    this.loadLotes();
  }

  loadTraspasos() {
    this.loading = true;
    this.cdr.markForCheck();
    this.inventarioService.getTraspasos().subscribe({
      next: (data) => {
        this.traspasos = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando traspasos:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadLotes() {
    // Para simplificar, obtenemos los lotes con stock > 0
    this.inventarioService.getLotes().subscribe(data => {
      this.lotesDisponibles = data.filter(l => l.cantidad_disponible > 0);
      
      // Extract unique almacenes from lotes just for the mock dropdown
      const alms = new Map();
      this.lotesDisponibles.forEach(l => {
        if (!alms.has(l.id_almacen)) {
          alms.set(l.id_almacen, { id: l.id_almacen, nombre: l.almacen_nombre });
        }
      });
      this.almacenes = Array.from(alms.values());
      this.cdr.markForCheck();
    });
  }

  onLoteChange(event: any) {
    const loteId = event.target.value;
    const lote = this.lotesDisponibles.find(l => l.id_lote == loteId);
    if (lote) {
      this.traspasoForm.patchValue({
        almacenOrigenId: lote.id_almacen
      });
    }
  }

  onSubmit() {
    if (this.traspasoForm.invalid) {
      this.traspasoForm.markAllAsTouched();
      return;
    }

    const origen = this.traspasoForm.value.almacenOrigenId;
    const destino = this.traspasoForm.value.almacenDestinoId;

    if (origen == destino) {
      Swal.fire('Atención', 'El almacén de destino no puede ser igual al de origen.', 'warning');
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();
    
    this.inventarioService.registrarTraspaso(this.traspasoForm.value).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Traspaso registrado correctamente', 'success');
        this.traspasoForm.reset({
          usuarioSolicitaId: this.traspasoForm.value.usuarioSolicitaId,
          cantidad: 0
        });
        this.saving = false;
        this.loadTraspasos();
        this.loadLotes();
      },
      error: (err) => {
        Swal.fire('Error', err, 'error');
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }
}
