import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { InventarioService } from '../service/inventario.service';
import { ItemService } from '../../crear-item/service/item.service';
import { AlmacenService } from '../../almacen/service/almacen.service';
import { forkJoin } from 'rxjs';
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
  lotesFiltrados: any[] = [];
  todosLotes: any[] = [];
  almacenes: any[] = []; 
  items: any[] = [];
  itemsConStock: any[] = [];
  almacenesDestino: any[] = [];
  rawTraspasos: any[] = [];

  itemSearchCtrl = new FormControl('');
  almacenDestinoSearchCtrl = new FormControl('');
  loteSearchCtrl = new FormControl('');
  itemSuggestions: any[] = [];
  almacenDestinoSuggestions: any[] = [];
  loteSuggestions: any[] = [];

  constructor(
    private inventarioService: InventarioService,
    private itemService: ItemService,
    private almacenService: AlmacenService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const userSession = JSON.parse(sessionStorage.getItem('user') || '{}');
    const defaultEmpId = userSession.idEmpleado ? Number(userSession.idEmpleado) : 1;

    this.traspasoForm = this.fb.group({
      itemId: [null, Validators.required],
      loteId: [null, Validators.required],
      almacenOrigenId: [null, Validators.required],
      almacenDestinoId: [null, Validators.required],
      cantidad: [0, [Validators.required, Validators.min(0.01)]],
      motivo: ['', Validators.required],
      usuarioSolicitaId: [defaultEmpId, Validators.required]
    });

    this.loadTraspasos();
    this.loadLotes();

    this.itemSearchCtrl.valueChanges.subscribe(val => {
      this.filterItems(val);
    });
    this.almacenDestinoSearchCtrl.valueChanges.subscribe(val => {
      this.filterAlmacenes(val);
    });
    this.loteSearchCtrl.valueChanges.subscribe(val => {
      this.filterLotes(val);
    });
  }

  filterItems(query: string | null) {
    if (!query) {
      this.itemSuggestions = [];
      return;
    }
    const q = query.toLowerCase();
    this.itemSuggestions = this.itemsConStock.filter(i => 
      i.nombre.toLowerCase().includes(q) || i.id.toString().includes(q)
    );
  }

  selectItem(item: any) {
    this.itemSearchCtrl.setValue(`${item.nombre} (ID: ${item.id})`, { emitEvent: false });
    this.itemSuggestions = [];
    this.traspasoForm.patchValue({ itemId: item.id });
    this.onItemChange(null);
  }

  filterAlmacenes(query: string | null) {
    if (!query) {
      this.almacenDestinoSuggestions = [];
      return;
    }
    const q = query.toLowerCase();
    this.almacenDestinoSuggestions = this.almacenesDestino.filter(a => 
      a.nombre.toLowerCase().includes(q) || a.id.toString().includes(q)
    );
  }

  selectAlmacen(almacen: any) {
    this.almacenDestinoSearchCtrl.setValue(`${almacen.nombre} (ID: ${almacen.id})`, { emitEvent: false });
    this.almacenDestinoSuggestions = [];
    this.traspasoForm.patchValue({ almacenDestinoId: almacen.id });
  }

  filterLotes(query: string | null) {
    if (!query) {
      this.loteSuggestions = [];
      return;
    }
    const q = query.toLowerCase();
    this.loteSuggestions = this.lotesFiltrados.filter(l => 
      l.id_lote.toString().includes(q) || (l.almacen_nombre || '').toLowerCase().includes(q)
    );
  }

  selectLote(lote: any) {
    this.loteSearchCtrl.setValue(`Lote #${lote.id_lote} - ${lote.almacen_nombre} (Disp: ${lote.cantidad_disponible})`, { emitEvent: false });
    this.loteSuggestions = [];
    this.traspasoForm.patchValue({ loteId: lote.id_lote });
    this.onLoteChange(null);
  }

  loadTraspasos() {
    this.loading = true;
    this.cdr.markForCheck();
    this.inventarioService.getTraspasos().subscribe({
      next: (data) => {
        this.rawTraspasos = data;
        this.mapTraspasosNames();
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
    forkJoin({
      lotes: this.inventarioService.getLotes(),
      items: this.itemService.getItems(),
      almacenes: this.almacenService.getAlmacenes()
    }).subscribe({
      next: ({ lotes, items, almacenes }) => {
        this.items = items;
        this.almacenes = almacenes;
        
        // Enhance lotes with actual names
        const enhancedLotes = lotes.map(l => {
          const item = items.find(i => i.id === l.id_item);
          if (item) {
            l.item_nombre = item.nombre;
            l.tipo_item = item.tipo || item.tipo_item; // needed for validation
          }
          const almacen = almacenes.find(a => a.id === l.id_almacen);
          if (almacen) {
            l.almacen_nombre = almacen.nombre;
          }
          return l;
        });

        this.todosLotes = enhancedLotes;
        this.lotesDisponibles = enhancedLotes.filter(l => l.cantidad_disponible > 0);
        this.itemsConStock = this.items.filter(i => this.lotesDisponibles.some(l => l.id_item === i.id));
        this.mapTraspasosNames();
        this.cdr.markForCheck();
      },
      error: err => console.error(err)
    });
  }

  mapTraspasosNames() {
    if (!this.rawTraspasos.length) return;
    
    this.traspasos = this.rawTraspasos.map(t => {
      // Find item from the lote
      const loteId = t.lote_id || t.lote_origen_id;
      const lote = this.todosLotes.find(l => l.id_lote === loteId);
      
      const origen = this.almacenes.find(a => a.id === t.almacen_origen_id || a.id === t.origen_almacen_id);
      const destino = this.almacenes.find(a => a.id === t.almacen_destino_id || a.id === t.destino_almacen_id);
      
      const item = this.items.find(i => i.id === t.id_item);

      return {
        ...t,
        item_nombre: item ? item.nombre : null,
        origen_nombre: origen ? origen.nombre : null,
        destino_nombre: destino ? destino.nombre : null,
        lote_id_display: loteId
      };
    });
    this.cdr.markForCheck();
  }

  onItemChange(event: any) {
    const itemId = this.traspasoForm.value.itemId;
    this.lotesFiltrados = this.lotesDisponibles.filter(l => l.id_item == itemId);
    
    let loteToSelect = null;
    if (this.lotesFiltrados.length > 0) {
      const isUEPS = this.lotesFiltrados[0].metodo_valuacion === 'UEPS';
      const sortedLotes = [...this.lotesFiltrados].sort((a, b) => {
        const dateA = new Date(a.fecha_entrada).getTime();
        const dateB = new Date(b.fecha_entrada).getTime();
        return isUEPS ? (dateB - dateA) : (dateA - dateB);
      });
      loteToSelect = sortedLotes[0];
    }
    
    this.traspasoForm.patchValue({
      loteId: loteToSelect ? loteToSelect.id_lote : null,
      almacenOrigenId: null,
      almacenDestinoId: null
    });
    this.almacenDestinoSearchCtrl.setValue('', { emitEvent: false });
    this.almacenesDestino = [];
    if (loteToSelect) {
      this.loteSearchCtrl.setValue(`Lote #${loteToSelect.id_lote} - ${loteToSelect.almacen_nombre} (Disp: ${loteToSelect.cantidad_disponible})`, { emitEvent: false });
      this.onLoteChange(null);
    } else {
      this.loteSearchCtrl.setValue('', { emitEvent: false });
    }
  }

  onLoteChange(event: any) {
    const loteId = this.traspasoForm.value.loteId;
    const lote = this.lotesDisponibles.find(l => l.id_lote == loteId);
    if (lote) {
      this.traspasoForm.patchValue({
        almacenOrigenId: lote.id_almacen,
        almacenDestinoId: null
      });

      // Validations: Filter almacenesDestino
      const itemType = (lote.tipo_item || '').toLowerCase();
      this.almacenesDestino = this.almacenes.filter(a => {
        // Can't be the same origin warehouse
        if (a.id === lote.id_almacen) return false;
        
        const aType = (a.tipo || '').toLowerCase();
        
        // If it's an insumo, destination must be Insumo or Mixto
        if (itemType.includes('insumo')) {
          return aType.includes('insumo') || aType.includes('mixto');
        } 
        // If it's a producto, destination must be Producto or Mixto
        else if (itemType.includes('producto')) {
          return aType.includes('producto') || aType.includes('mixto');
        }
        
        return true;
      });
    } else {
      this.almacenesDestino = [];
      this.traspasoForm.patchValue({ almacenOrigenId: null, almacenDestinoId: null });
    }
  }

  getDestinoCapacityInfo() {
    const id = this.traspasoForm?.get('almacenDestinoId')?.value;
    const almacen = this.almacenes.find(a => a.id == id);
    if (!almacen) return null;

    const currentStock = (almacen.productos || []).reduce((acc: number, p: any) => acc + (p.stock || 0), 0);
    const maxCapacity = almacen.capacidadMaxima;
    const hasLimit = typeof maxCapacity === 'number' && maxCapacity > 0;
    const available = hasLimit ? (maxCapacity - currentStock) : null;

    return {
      nombre: almacen.nombre,
      currentStock,
      maxCapacity,
      hasLimit,
      available
    };
  }

  isOverCapacity(): boolean {
    const info = this.getDestinoCapacityInfo();
    if (!info || !info.hasLimit) return false;
    const cantidad = this.traspasoForm.get('cantidad')?.value || 0;
    return cantidad > (info.available || 0);
  }

  getSelectedLoteInfo() {
    const loteId = this.traspasoForm?.get('loteId')?.value;
    if (!loteId) return null;
    return this.lotesDisponibles.find(l => l.id_lote === loteId) || null;
  }

  isOverLoteQuantity(): boolean {
    const lote = this.getSelectedLoteInfo();
    if (!lote) return false;
    const cantidad = this.traspasoForm.get('cantidad')?.value || 0;
    return cantidad > lote.cantidad_disponible;
  }

  onSubmit() {
    if (this.traspasoForm.invalid) {
      this.traspasoForm.markAllAsTouched();
      return;
    }

    const origen = this.traspasoForm.value.almacenOrigenId;
    const destino = this.traspasoForm.value.almacenDestinoId;

    if (!destino) {
      Swal.fire('Atención', 'Debes seleccionar un almacén destino válido.', 'warning');
      return;
    }

    if (origen == destino) {
      Swal.fire('Atención', 'El almacén de destino no puede ser igual al de origen.', 'warning');
      return;
    }

    const capacityInfo = this.getDestinoCapacityInfo();
    if (capacityInfo && capacityInfo.hasLimit) {
      const cantidad = this.traspasoForm.value.cantidad;
      if (cantidad > (capacityInfo.available || 0)) {
        Swal.fire(
          'Capacidad Excedida',
          `No se puede realizar el traspaso. La cantidad a transferir (${cantidad}) excede la capacidad disponible del almacén de destino (${capacityInfo.available} uds de un máximo de ${capacityInfo.maxCapacity} uds).`,
          'error'
        );
        return;
      }
    }

    this.saving = true;
    this.cdr.markForCheck();
    
    const dto = {
      loteId: this.traspasoForm.value.loteId,
      almacenOrigenId: origen,
      almacenDestinoId: destino,
      cantidad: this.traspasoForm.value.cantidad,
      motivo: this.traspasoForm.value.motivo,
      usuarioSolicitaId: this.traspasoForm.value.usuarioSolicitaId
    };
    
    this.inventarioService.registrarTraspaso(dto).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Traspaso registrado correctamente', 'success');
        this.traspasoForm.reset({
          usuarioSolicitaId: this.traspasoForm.value.usuarioSolicitaId,
          cantidad: 0
        });
        this.itemSearchCtrl.setValue('', { emitEvent: false });
        this.almacenDestinoSearchCtrl.setValue('', { emitEvent: false });
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
