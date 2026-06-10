import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { AlmacenListComponent } from "./almacen-list/almacen-list.component";
import { AlmacenAddComponent } from "./almacen-add/almacen-add.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Almacen } from '../../interfaces/almacen.interface';
import { AlmacenService } from './service/almacen.service';

@Component({
  selector: 'app-almacen',
  imports: [
    AlmacenListComponent,
    // AlmacenAddComponent,
    FormsModule,
    ReactiveFormsModule,

]
  ,
  templateUrl: './almacen.component.html',
  styleUrl: './almacen.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlmacenComponent implements OnInit {
    almacenes: Almacen[] = [];
    errorMessage: string | null = null;

    constructor(
        private almacenService:AlmacenService,
        private cdr: ChangeDetectorRef
      ){}

      ngOnInit(): void {
        this.loadAlmacenes();
      }

      loadAlmacenes():void{
        console.log('Cargando almacenes...');
        this.almacenService.getAlmacenes().subscribe(
          (data) => {
            this.almacenes = data;
            console.log('Almacenes cargados:', data);
            this.errorMessage = null;
            this.cdr.markForCheck();
          },
          (error) => {
            this.errorMessage = 'Hubo un error al cargar los almacenes';
            this.cdr.markForCheck();
          }
        );
      }


}
