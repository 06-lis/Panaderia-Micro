import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../service/inventario.service';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimientos.component.html',
  styleUrl: './movimientos.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovimientosComponent implements OnInit {
  movimientos: any[] = [];
  filteredMovimientos: any[] = [];
  loading = false;
  searchTerm = '';

  constructor(
    private inventarioService: InventarioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadMovimientos();
  }

  loadMovimientos() {
    this.loading = true;
    this.cdr.markForCheck();
    this.inventarioService.getMovimientos().subscribe({
      next: (data) => {
        this.movimientos = data;
        this.filteredMovimientos = [...data];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando movimientos:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  filterMovimientos() {
    if (!this.searchTerm) {
      this.filteredMovimientos = [...this.movimientos];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredMovimientos = this.movimientos.filter(m => 
        (m.tipo_movimiento && m.tipo_movimiento.toLowerCase().includes(term)) ||
        (m.lote_id && m.lote_id.toString().includes(term)) ||
        (m.motivo && m.motivo.toLowerCase().includes(term))
      );
    }
    this.cdr.markForCheck();
  }
}
