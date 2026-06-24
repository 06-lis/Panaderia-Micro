import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../service/inventario.service';
import { ItemService } from '../../crear-item/service/item.service';
import { UsuarioService } from '../../usuario/usuario.service';
import { forkJoin } from 'rxjs';

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
    private itemService: ItemService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadMovimientos();
  }

  loadMovimientos() {
    this.loading = true;
    this.cdr.markForCheck();
    
    forkJoin({
      movs: this.inventarioService.getMovimientos(),
      items: this.itemService.getItems(),
      usuarios: this.usuarioService.getUsuarios()
    }).subscribe({
      next: ({ movs, items, usuarios }) => {
        // Map item names and user names
        movs.forEach((m: any) => {
          // Map Item
          const item = items.find(i => i.id === m.id_item);
          if (item) {
            m.item_nombre = item.nombre;
          } else {
            m.item_nombre = 'Item ' + m.id_item;
          }
          
          // Map Responsable
          // Backend returns "Emp ID" in responsable_nombre or we can extract the ID.
          // Since the backend returns "Emp X", we can try to extract X
          let idEmpleado: number | null = null;
          if (m.responsable_nombre && m.responsable_nombre.startsWith('Emp ')) {
            idEmpleado = parseInt(m.responsable_nombre.replace('Emp ', ''), 10);
          }
          
          if (idEmpleado && usuarios) {
             const user = usuarios.find(u => u.userId === idEmpleado);
             if (user) {
               m.responsable_nombre = user.fullname || user.username || m.responsable_nombre;
             }
          }
        });

        // Grouping logic
        const grouped: any[] = [];
        const mapGroups = new Map<string, any>();

        movs.forEach((m: any) => {
          if (m.referencia_tipo && m.referencia_id) {
            const key = `${m.referencia_tipo}-${m.referencia_id}`;
            if (!mapGroups.has(key)) {
              const group = {
                isGroup: true,
                title: `${m.referencia_tipo} #${m.referencia_id}`,
                fecha_movimiento: m.fecha_movimiento,
                tipo_movimiento: m.referencia_tipo,
                motivo: 'Agrupado',
                responsable_nombre: m.responsable_nombre,
                detalles: [],
                expanded: false,
                costo_total: 0,
                cantidad: 0
              };
              mapGroups.set(key, group);
              grouped.push(group);
            }
            const group = mapGroups.get(key);
            group.detalles.push(m);
            group.costo_total += m.costo_total;
            group.cantidad += m.cantidad;
          } else {
            // Standalone movement
            grouped.push(m);
          }
        });

        this.movimientos = grouped;
        this.filteredMovimientos = [...grouped];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando movimientos u ítems:', err);
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
      this.filteredMovimientos = this.movimientos.filter(m => {
        if (m.isGroup) {
          return m.title.toLowerCase().includes(term);
        }
        return (m.tipo_movimiento && m.tipo_movimiento.toLowerCase().includes(term)) ||
               (m.lote_id && m.lote_id.toString().includes(term)) ||
               (m.motivo && m.motivo.toLowerCase().includes(term));
      });
    }
    this.cdr.markForCheck();
  }
  
  toggleGroup(group: any) {
    if (group.isGroup) {
      group.expanded = !group.expanded;
      this.cdr.markForCheck();
    }
  }
}
