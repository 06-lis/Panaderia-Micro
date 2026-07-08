import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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
  imports: [CommonModule, ReactiveFormsModule],
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
  selectedAlmacenOrigenId: number = 0;
  selectedAlmacenDestinoId: number = 0;
  destinoCapacityInfo: { maxCapacity: number, currentStock: number, available: number, valid: boolean } | null = null;
  approvalLotes: any[] = [];
  productionMovimientos: any[] = []; // Para historial de lotes

  almacenOrigenSearchCtrl = new FormControl('');
  almacenDestinoSearchCtrl = new FormControl('');
  almacenOrigenSuggestions: any[] = [];
  almacenDestinoSuggestions: any[] = [];

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
    this.almacenOrigenSearchCtrl.valueChanges.subscribe(val => this.filterAlmacenOrigen(val));
    this.almacenDestinoSearchCtrl.valueChanges.subscribe(val => this.filterAlmacenDestino(val));
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
    this.selectedAlmacenOrigenId = 0;
    this.selectedAlmacenDestinoId = 0;
    this.destinoCapacityInfo = null;
    this.approvalLotes = [];
    this.showApprovalModal = true;
    this.cdr.markForCheck();
  }

  closeApprovalModal(): void {
    this.selectedProduction = null;
    this.showApprovalModal = false;
    this.approvalLotes = [];
    this.almacenOrigenSearchCtrl.setValue('', { emitEvent: false });
    this.almacenDestinoSearchCtrl.setValue('', { emitEvent: false });
    this.almacenOrigenSuggestions = [];
    this.almacenDestinoSuggestions = [];
    this.cdr.markForCheck();
  }

  filterAlmacenOrigen(query: string | null) {
    const q = (query || '').toLowerCase();
    this.almacenOrigenSuggestions = this.almacenes.filter(a => {
      const aType = (a.tipo || '').toLowerCase();
      return (aType === 'insumo' || aType === 'mixto') && 
             (a.nombre.toLowerCase().includes(q) || a.id.toString().includes(q));
    });
    this.cdr.markForCheck();
  }

  selectAlmacenOrigen(almacen: any) {
    this.almacenOrigenSearchCtrl.setValue(`${almacen.nombre} (${almacen.tipo})`, { emitEvent: false });
    this.almacenOrigenSuggestions = [];
    this.onAlmacenOrigenSelected(almacen.id);
  }

  filterAlmacenDestino(query: string | null) {
    const q = (query || '').toLowerCase();
    this.almacenDestinoSuggestions = this.almacenes.filter(a => {
      const aType = (a.tipo || '').toLowerCase();
      return (aType === 'producto' || aType === 'mixto') && 
             (a.nombre.toLowerCase().includes(q) || a.id.toString().includes(q));
    });
    this.cdr.markForCheck();
  }

  selectAlmacenDestino(almacen: any) {
    this.almacenDestinoSearchCtrl.setValue(`${almacen.nombre} (${almacen.tipo})`, { emitEvent: false });
    this.almacenDestinoSuggestions = [];
    this.onAlmacenDestinoSelected(almacen.id);
  }

  onAlmacenOrigenSelected(almacenId: number): void {
    this.selectedAlmacenOrigenId = almacenId;
    if (this.selectedAlmacenOrigenId > 0 && this.selectedProduction) {
      // Fetch lotes for this almacen
      this.inventarioService.getLotes().subscribe({
        next: (lotes) => {
          // Filter lotes belonging to the selected warehouse and corresponding to the required items
          const requiredItemIds = this.selectedProduction?.detalles?.filter(d => d.tipoMovimiento === 'Egreso').map(d => d.itemId) || [];
          
          this.approvalLotes = lotes.filter(l => 
            l.id_almacen === this.selectedAlmacenOrigenId && 
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

  onAlmacenDestinoSelected(almacenId: number): void {
    this.selectedAlmacenDestinoId = almacenId;
    if (this.selectedAlmacenDestinoId > 0 && this.selectedProduction) {
      const almacen = this.almacenes.find(a => a.id === this.selectedAlmacenDestinoId);
      if (almacen && almacen.capacidadMaxima) {
        const currentStock = (almacen.productos || []).reduce((sum: number, s: any) => sum + (s.stock || 0), 0);
        const maxCapacity = almacen.capacidadMaxima;
        const available = maxCapacity - currentStock;
        const incoming = this.selectedProduction?.cantidadProducida || 0;
        this.destinoCapacityInfo = {
          maxCapacity,
          currentStock,
          available,
          valid: incoming <= available
        };
        this.cdr.markForCheck();
      } else {
        this.destinoCapacityInfo = { maxCapacity: 0, currentStock: 0, available: 999999, valid: true }; // Sin limite
        this.cdr.markForCheck();
      }
    } else {
      this.destinoCapacityInfo = null;
      this.cdr.markForCheck();
    }
  }

  approveProduction(): void {
    if (!this.selectedProduction || !this.selectedProduction.id) return;
    if (this.selectedAlmacenOrigenId === 0 || this.selectedAlmacenDestinoId === 0) {
      Swal.fire('Error', 'Debes seleccionar un almacén de origen y uno de destino.', 'error');
      return;
    }

    // Verify stock from lotes directly before approval
    const requiredItems = this.selectedProduction?.detalles?.filter(d => d.tipoMovimiento === 'Egreso') || [];
    let stockValid = true;
    let stockErrors: string[] = [];

    requiredItems.forEach(reqItem => {
      const sumLotes = this.approvalLotes
        .filter(l => l.id_item === reqItem.itemId)
        .reduce((sum, l) => sum + l.cantidad_disponible, 0);
        
      if (sumLotes < reqItem.cantidad) {
        stockValid = false;
        const itemName = this.itemsMap.get(reqItem.itemId) || `Item ${reqItem.itemId}`;
        stockErrors.push(`- ${itemName}: Requerido ${reqItem.cantidad}, Disponible ${sumLotes}`);
      }
    });

    if (!stockValid) {
      Swal.fire({
        icon: 'error',
        title: 'Stock Insuficiente',
        html: `No hay suficientes insumos en el almacén de origen seleccionado:<br><br>${stockErrors.join('<br>')}`,
        confirmButtonColor: '#3E261A'
      });
      return;
    }

    if (this.destinoCapacityInfo && !this.destinoCapacityInfo.valid) {
      Swal.fire('Error', 'El almacén destino no tiene capacidad suficiente.', 'error');
      return;
    }

    const prodId = this.selectedProduction.id;
    const almacenOrigenId = this.selectedAlmacenOrigenId;
    const almacenDestinoId = this.selectedAlmacenDestinoId;

    const userSession = JSON.parse(sessionStorage.getItem('user') || '{}');
    const employeeId = userSession.idEmpleado || userSession.IdEmpleado || userSession.id_empleado || null;

    if (employeeId) {
      this.executeApproval(prodId, employeeId, almacenOrigenId, almacenDestinoId);
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
          this.executeApproval(prodId, Number(resultEmp.value), almacenOrigenId, almacenDestinoId);
        }
      });
    }
  }

  private executeApproval(id: number, employeeId: number, almacenOrigenId: number, almacenDestinoId: number): void {
    Swal.fire({
      title: 'Aprobando orden...',
      text: 'Se validará el stock de insumos y se actualizarán las existencias.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.productionService.aprobarProduccion(id, employeeId, almacenOrigenId, almacenDestinoId).subscribe({
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
