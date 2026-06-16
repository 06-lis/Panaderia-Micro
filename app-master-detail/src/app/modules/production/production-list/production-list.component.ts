import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductionService } from '../service/production.service';
import { ItemService } from '../../crear-item/service/item.service';
import { EmpleadoService } from '../../usuario/empleado.service';
import { AlmacenService } from '../../almacen/service/almacen.service';
import { InventarioService } from '../../inventario/service/inventario.service';
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
  almacenes: any[] = [];
  loading = false;
  currentStatusFilter: 'pendiente' | 'aprobado' | 'rechazado' = 'pendiente';
  selectedProduction: Produccion | null = null;
  showDetailsModal = false;
  
  showApprovalModal = false;
  selectedAlmacenId: number = 0;
  approvalLotes: any[] = [];
  productionMovimientos: any[] = []; // Para historial de lotes

  constructor(
    private productionService: ProductionService,
    private itemService: ItemService,
    private empleadoService: EmpleadoService,
    private almacenService: AlmacenService,
    private inventarioService: InventarioService,
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

    this.almacenService.getAlmacenes().subscribe({
      next: (almacenesData) => {
        this.almacenes = almacenesData;
      },
      error: (err) => console.error('Error al cargar almacenes:', err)
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
    this.productionMovimientos = [];
    
    if (prod.estado.toLowerCase() === 'aprobado') {
      this.inventarioService.getMovimientos().subscribe({
        next: (movimientos) => {
          // Adivinar movimientos relacionados a esta producción (consumos recientes de los items de la orden)
          const itemIds = prod.detalles?.map(d => d.itemId) || [];
          
          this.productionMovimientos = movimientos.filter(m => 
            m.tipo_movimiento === 'Consumo' && 
            itemIds.includes(m.id_item)
            // Ideally filter by date close to prod.fechaAutorizacion, but we take all for traceability
          ).slice(0, 10); // Show max 10 recent consumptions for these items
          this.cdr.markForCheck();
        }
      });
    }
    
    this.cdr.markForCheck();
  }

  closeDetails(): void {
    this.selectedProduction = null;
    this.showDetailsModal = false;
    this.productionMovimientos = [];
    this.cdr.markForCheck();
  }

  openApprovalValidation(prod: Produccion): void {
    this.selectedProduction = prod;
    this.selectedAlmacenId = 0;
    this.approvalLotes = [];
    this.showApprovalModal = true;
    this.cdr.markForCheck();
  }

  closeApprovalModal(): void {
    this.selectedProduction = null;
    this.showApprovalModal = false;
    this.approvalLotes = [];
    this.cdr.markForCheck();
  }

  onAlmacenSelected(event: any): void {
    this.selectedAlmacenId = Number(event.target.value);
    if (this.selectedAlmacenId > 0 && this.selectedProduction) {
      // Fetch lotes for this almacen
      this.inventarioService.getLotes().subscribe({
        next: (lotes) => {
          // Filter lotes belonging to the selected warehouse and corresponding to the required items
          const requiredItemIds = this.selectedProduction?.detalles?.filter(d => d.tipoMovimiento === 'Egreso').map(d => d.itemId) || [];
          
          this.approvalLotes = lotes.filter(l => 
            l.id_almacen === this.selectedAlmacenId && 
            requiredItemIds.includes(l.id_item) &&
            l.cantidad_disponible > 0
          );
          this.cdr.markForCheck();
        }
      });
    } else {
      this.approvalLotes = [];
      this.cdr.markForCheck();
    }
  }

  approveProduction(): void {
    if (!this.selectedProduction || !this.selectedProduction.id) return;
    if (this.selectedAlmacenId === 0) {
      Swal.fire('Error', 'Debes seleccionar un almacén válido.', 'error');
      return;
    }

    const prodId = this.selectedProduction.id;
    const almacenId = this.selectedAlmacenId;

    const userSession = JSON.parse(sessionStorage.getItem('user') || '{}');
    const employeeId = userSession.idEmpleado;

    if (employeeId) {
      this.executeApproval(prodId, employeeId, almacenId);
    } else {
      // Ask for Employee if missing
      const empOptions: { [key: string]: string } = {};
      this.employeesList.forEach(e => {
        empOptions[e.idEmpleado.toString()] = `${e.nombre} ${e.apellido}`;
      });

      Swal.fire({
        title: 'Seleccionar Empleado Autorizador',
        text: 'Selecciona quién autoriza esta producción:',
        input: 'select',
        inputOptions: empOptions,
        inputPlaceholder: 'Selecciona un empleado...',
        showCancelButton: true,
        confirmButtonColor: '#8E4E2A',
        cancelButtonColor: '#3E261A',
        confirmButtonText: 'Autorizar',
        cancelButtonText: 'Cancelar'
      }).then((resultEmp) => {
        if (resultEmp.isConfirmed && resultEmp.value) {
          this.executeApproval(prodId, Number(resultEmp.value), almacenId);
        }
      });
    }
  }

  private executeApproval(id: number, employeeId: number, almacenId: number): void {
    Swal.fire({
      title: 'Aprobando orden...',
      text: 'Se validará el stock de insumos y se actualizarán las existencias.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.productionService.aprobarProduccion(id, employeeId, almacenId).subscribe({
      next: (response) => {
        Swal.close();
        this.closeApprovalModal();
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
