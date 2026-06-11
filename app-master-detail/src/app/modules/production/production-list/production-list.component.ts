import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductionService } from '../service/production.service';
import { ItemService } from '../../crear-item/service/item.service';
import { EmpleadoService } from '../../usuario/empleado.service';
import { Produccion } from '../../../interfaces/production.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-production-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './production-list.component.html',
  styleUrl: './production-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductionListComponent implements OnInit {
  productions: Produccion[] = [];
  itemsMap = new Map<number, string>();
  employeesMap = new Map<number, string>();
  employeesList: any[] = [];
  loading = false;
  currentStatusFilter: 'pendiente' | 'aprobado' | 'rechazado' = 'pendiente';
  selectedProduction: Produccion | null = null;
  showDetailsModal = false;

  constructor(
    private productionService: ProductionService,
    private itemService: ItemService,
    private empleadoService: EmpleadoService,
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
        items.forEach(i => {
          this.itemsMap.set(i.id || i.itemId, i.nombre || i.nombreProducto);
        });

        this.loadEmployees();
      },
      error: (err) => {
        console.error('Error al cargar items en lista de produccion:', err);
        this.loadEmployees();
      }
    });
  }

  loadEmployees(): void {
    this.empleadoService.getEmpleados().subscribe({
      next: (emps) => {
        this.employeesList = emps;
        this.employeesMap.clear();
        emps.forEach(e => {
          this.employeesMap.set(e.idEmpleado, `${e.nombre} ${e.apellido}`);
        });

        this.loadProductions();
      },
      error: (err) => {
        console.error('Error al cargar empleados en lista de produccion:', err);
        this.loadProductions();
      }
    });
  }

  loadProductions(): void {
    this.productionService.getProductions().subscribe({
      next: (data) => {
        this.productions = data.map(prod => ({
          ...prod,
          nombreEmpleadoSolicita: this.employeesMap.get(prod.empleadoSolicitaId) || `Empleado #${prod.empleadoSolicitaId}`,
          nombreEmpleadoAutoriza: prod.empleadoAutorizaId ? (this.employeesMap.get(prod.empleadoAutorizaId) || `Empleado #${prod.empleadoAutorizaId}`) : undefined,
          detalles: (prod.detalles || []).map(d => ({
            ...d,
            nombreItem: this.itemsMap.get(d.itemId) || `Item #${d.itemId}`
          }))
        }));
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar producciones:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get filteredProductions(): Produccion[] {
    return this.productions.filter(p => p.estado.toLowerCase() === this.currentStatusFilter);
  }

  setFilter(status: 'pendiente' | 'aprobado' | 'rechazado'): void {
    this.currentStatusFilter = status;
    this.cdr.markForCheck();
  }

  openDetails(prod: Produccion): void {
    this.selectedProduction = prod;
    this.showDetailsModal = true;
    this.cdr.markForCheck();
  }

  closeDetails(): void {
    this.selectedProduction = null;
    this.showDetailsModal = false;
    this.cdr.markForCheck();
  }

  approveProduction(prod: Produccion): void {
    if (!prod.id) return;

    const userSession = JSON.parse(sessionStorage.getItem('user') || '{}');
    const employeeId = userSession.idEmpleado;

    if (employeeId) {
      this.executeApproval(prod.id, employeeId);
    } else {
      const options: { [key: string]: string } = {};
      this.employeesList.forEach(e => {
        options[e.idEmpleado.toString()] = `${e.nombre} ${e.apellido}`;
      });

      Swal.fire({
        title: 'Seleccionar Empleado Autorizador',
        text: 'Tu usuario no está vinculado a un empleado registrado. Selecciona quién autoriza esta producción:',
        input: 'select',
        inputOptions: options,
        inputPlaceholder: 'Selecciona un empleado...',
        showCancelButton: true,
        confirmButtonColor: '#8E4E2A',
        cancelButtonColor: '#3E261A',
        confirmButtonText: 'Autorizar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (!value) {
            return 'Debes seleccionar un empleado autorizador';
          }
          return null;
        }
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          this.executeApproval(prod.id!, Number(result.value));
        }
      });
    }
  }

  private executeApproval(id: number, employeeId: number): void {
    Swal.fire({
      title: 'Aprobando orden...',
      text: 'Se validará el stock de insumos y se actualizarán las existencias.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.productionService.aprobarProduccion(id, employeeId).subscribe({
      next: (response) => {
        Swal.close();
        Swal.fire({
          icon: 'success',
          title: '¡Producción Aprobada!',
          text: 'La producción se ha registrado y el stock ha sido actualizado correctamente.',
          confirmButtonColor: '#8E4E2A'
        });
        this.loadData();
      },
      error: (errorMsg) => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error de Validación',
          text: errorMsg || 'No se pudo aprobar la orden. Valida el stock de insumos.',
          confirmButtonColor: '#3E261A'
        });
      }
    });
  }

  rejectProduction(prod: Produccion): void {
    if (!prod.id) return;

    Swal.fire({
      title: '¿Rechazar Producción?',
      text: '¿Estás seguro de rechazar esta solicitud de producción? Esta acción no consumirá insumos ni sumará stock.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3E261A',
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Procesando rechazo...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.productionService.rechazarProduccion(prod.id!).subscribe({
          next: () => {
            Swal.close();
            Swal.fire({
              icon: 'success',
              title: '¡Rechazada!',
              text: 'La orden ha sido rechazada.',
              confirmButtonColor: '#8E4E2A'
            });
            this.loadData();
          },
          error: (err) => {
            Swal.close();
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err || 'No se pudo rechazar la orden.',
              confirmButtonColor: '#3E261A'
            });
          }
        });
      }
    });
  }
}
