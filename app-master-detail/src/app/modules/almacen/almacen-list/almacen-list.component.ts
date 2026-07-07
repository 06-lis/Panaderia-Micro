import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Almacen } from '../../../interfaces/almacen.interface';
import { AlmacenService } from '../service/almacen.service';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AsignarProductoAlmacenService } from '../../AsignarProducto/asignar-producto-almacen.service';

@Component({
  selector: 'app-almacen-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './almacen-list.component.html',
  styleUrl: './almacen-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlmacenListComponent implements OnChanges {
  @Input() public almacenes: Almacen[] = [];

  selectedAlmacen?: Almacen;
  mensaje: string = '';
  selectedIdFromQuery?: number;

  constructor(
    private almacenService: AlmacenService,
    private asignarProductoAlmacen: AsignarProductoAlmacenService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(params => {
      if (params['selectedId']) {
        this.selectedIdFromQuery = Number(params['selectedId']);
        this.checkAndSelectFromQuery();
      }
    });
  }

  checkAndSelectFromQuery(): void {
    if (this.selectedIdFromQuery && this.almacenes.length > 0) {
      const warehouse = this.almacenes.find(a => a.id === this.selectedIdFromQuery);
      if (warehouse) {
        this.selectAlmacen(warehouse);
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['almacenes'] && this.almacenes) {
      if (this.almacenes.length > 0) {
        if (this.selectedIdFromQuery) {
          this.checkAndSelectFromQuery();
        } else if (!this.selectedAlmacen || !this.almacenes.some(a => a.id === this.selectedAlmacen?.id)) {
          this.selectAlmacen(this.almacenes[0]);
        } else {
          const updated = this.almacenes.find(a => a.id === this.selectedAlmacen?.id);
          if (updated) {
            this.selectedAlmacen = updated;
          }
        }
      } else {
        this.selectedAlmacen = undefined;
      }
      this.cdr.markForCheck();
    }
  }

  selectAlmacen(almacen: Almacen): void {
    this.selectedAlmacen = almacen;
    this.cdr.markForCheck();
  }

  reloadAlmacenes(): void {
    this.almacenService.getAlmacenes().subscribe({
      next: (almacenes) => {
        this.almacenes = almacenes;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.cdr.markForCheck();
      },
    });
  }

  crearAlmacen(): void {
    this.router.navigate(['/dashboard/almacen/add']);
  }
}
