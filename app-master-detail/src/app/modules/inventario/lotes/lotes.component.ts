import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../service/inventario.service';

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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadLotes();
  }

  loadLotes() {
    this.loading = true;
    this.cdr.markForCheck();
    this.inventarioService.getLotes().subscribe({
      next: (data) => {
        this.lotes = data;
        this.filteredLotes = [...data];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando lotes:', err);
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
