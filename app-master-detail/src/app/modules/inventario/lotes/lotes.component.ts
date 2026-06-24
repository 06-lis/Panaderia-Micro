import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../service/inventario.service';
import { ItemService } from '../../crear-item/service/item.service';
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

  constructor(
    private inventarioService: InventarioService,
    private itemService: ItemService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadLotes();
  }

  loadLotes() {
    this.loading = true;
    this.cdr.markForCheck();
    
    // Fetch items and lotes in parallel
    forkJoin({
      lotes: this.inventarioService.getLotes(),
      items: this.itemService.getItems()
    }).subscribe({
      next: ({ lotes, items }) => {
        // Map item names
        this.lotes = lotes.map(l => {
          const item = items.find(i => i.id === l.id_item);
          if (item) {
            l.item_nombre = item.nombre;
          }
          return l;
        });
        
        this.filteredLotes = [...this.lotes];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando lotes o ítems:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  filterLotes() {
    if (!this.searchTerm) {
      this.filteredLotes = [...this.lotes];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredLotes = this.lotes.filter(l => 
        (l.item_nombre && l.item_nombre.toLowerCase().includes(term)) ||
        (l.almacen_nombre && l.almacen_nombre.toLowerCase().includes(term)) ||
        (l.id_lote && l.id_lote.toString().includes(term))
      );
    }
    this.cdr.markForCheck();
  }
}
