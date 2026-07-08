import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../service/inventario.service';
import { ItemService } from '../../crear-item/service/item.service';
import { AlmacenService } from '../../almacen/service/almacen.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-lotes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lotes.component.html',
  styleUrl: './lotes.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LotesComponent implements OnInit {
  lotes: any[] = [];
  filteredLotes: any[] = [];
  loading = false;
  searchTerm = '';
  currentFilter = 'todos';

  constructor(
    private inventarioService: InventarioService,
    private itemService: ItemService,
    private almacenService: AlmacenService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadLotes();
  }

  loadLotes() {
    this.loading = true;
    this.cdr.markForCheck();
    
    // Fetch items, lotes, movimientos, and almacenes in parallel
    forkJoin({
      lotes: this.inventarioService.getLotes(),
      items: this.itemService.getItems(),
      movimientos: this.inventarioService.getMovimientos(),
      almacenes: this.almacenService.getAlmacenes()
    }).subscribe({
      next: ({ lotes, items, movimientos, almacenes }) => {
        // Map item names and attach movimientos
        this.lotes = lotes.map(l => {
          const item = items.find(i => i.id === l.id_item);
          if (item) {
            l.item_nombre = item.nombre;
          }
          const almacen = almacenes.find(a => a.id === l.id_almacen);
          if (almacen) {
            l.almacen_nombre = almacen.nombre;
          }
          // Filter movimientos for this specific lote
          l.movimientos_detalle = movimientos.filter(m => m.lote_id === l.id_lote);
          l.expanded = false;
          return l;
        });
        
        this.filteredLotes = [...this.lotes];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando lotes, ítems o movimientos:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  toggleExpanded(lote: any) {
    lote.expanded = !lote.expanded;
    this.cdr.markForCheck();
  }

  getVencimientoStatus(fecha: string): 'ok' | 'warning' | 'danger' | 'none' {
    if (!fecha) return 'none';
    const fVenc = new Date(fecha);
    const fHoy = new Date();
    const diffTime = fVenc.getTime() - fHoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'danger'; // Vencido
    if (diffDays <= 7) return 'warning'; // Por vencer (7 días)
    return 'ok';
  }

  filterLotes() {
    let temp = [...this.lotes];

    if (this.currentFilter === 'recientes') {
      temp.forEach(l => {
        const movimientos = l.movimientos_detalle || [];
        if (movimientos.length > 0) {
          l._ultimo_consumo = Math.max(...movimientos.map((m: any) => new Date(m.fecha_movimiento).getTime()));
        } else {
          l._ultimo_consumo = 0;
        }
      });
      temp = temp.filter(l => l._ultimo_consumo > 0).sort((a, b) => b._ultimo_consumo - a._ultimo_consumo);
    } else if (this.currentFilter === 'por_vencer') {
      temp = temp.filter(l => this.getVencimientoStatus(l.fecha_vencimiento) === 'warning');
    } else if (this.currentFilter === 'vencidos') {
      temp = temp.filter(l => this.getVencimientoStatus(l.fecha_vencimiento) === 'danger');
    } else if (this.currentFilter === 'poco_stock') {
      temp = temp.filter(l => l.cantidad_disponible > 0 && l.cantidad_disponible <= (l.cantidad_inicial * 0.2));
    } else if (this.currentFilter === 'agotados') {
      temp = temp.filter(l => l.cantidad_disponible === 0);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      temp = temp.filter(l => 
        (l.item_nombre && l.item_nombre.toLowerCase().includes(term)) ||
        (l.almacen_nombre && l.almacen_nombre.toLowerCase().includes(term)) ||
        (l.id_lote && l.id_lote.toString().includes(term))
      );
    }
    
    this.filteredLotes = temp;
    this.cdr.markForCheck();
  }
}
