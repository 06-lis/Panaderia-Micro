import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NotaCompraService } from '../nota-compra/service/nota-compra.service';
import { ProveedorService } from '../proveedor/service/proveedor.service';
import { EmpleadoService } from '../../usuario/empleado.service';
import { NotaCompra } from '../../../interfaces/nota-compra.interface';
import { Proveedor, getProveedorNombre } from '../../../interfaces/proveedor.interface';

@Component({
  selector: 'app-detalle-compra',
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-compra.component.html',
  styleUrl: './detalle-compra.component.css',
})
export class DetalleCompraComponent implements OnInit {
  nota = signal<NotaCompra | null>(null);
  empleadoNombre = signal<string>('Cargando...');
  loading = signal(true);
  errorMsg = signal('');

  constructor(
    private route: ActivatedRoute,
    private notaService: NotaCompraService,
    private proveedorService: ProveedorService,
    private empleadoService: EmpleadoService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.loading.set(false);
      this.errorMsg.set('ID de nota no especificado.');
      return;
    }
    this.notaService.getNotaCompraById(id).subscribe({
      next: (data) => {
        if (!data) {
          this.errorMsg.set('No se encontró la nota de compra.');
          this.loading.set(false);
          return;
        }

        // Cargar nombre del empleado
        this.empleadoService.getEmpleadoById(data.idEmpleado).subscribe({
          next: (emp) => {
            if (emp && emp.nombre) {
              this.empleadoNombre.set(`${emp.nombre} ${emp.apellido}`);
            } else {
              this.empleadoNombre.set(`Empleado #${data.idEmpleado}`);
            }
          },
          error: () => {
            this.empleadoNombre.set(`Empleado #${data.idEmpleado}`);
          }
        });

        // Enriquecer con proveedor
        this.proveedorService.getProveedorById(data.idProveedor).subscribe({
          next: (prov) => {
            this.nota.set({ ...data, proveedor: prov ?? undefined });
            this.loading.set(false);
          },
          error: () => {
            this.nota.set(data);
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.errorMsg.set('Error al cargar la nota de compra. Verifica que el servicio esté activo.');
        this.loading.set(false);
      }
    });
  }

  get proveedorNombre(): string {
    const p = this.nota()?.proveedor;
    if (!p) return `Proveedor #${this.nota()?.idProveedor}`;
    return getProveedorNombre(p);
  }

  get totalUnidades(): number {
    return this.nota()?.detalles.reduce((sum, d) => sum + d.cantidad, 0) ?? 0;
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Completada': return 'badge-success';
      case 'Pendiente': return 'badge-warning';
      case 'Cancelada': return 'badge-danger';
      default: return 'badge-info';
    }
  }
}
