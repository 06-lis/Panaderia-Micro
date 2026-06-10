import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';
import { Almacen } from '../../../interfaces/almacen.interface';
import { AlmacenService } from '../service/almacen.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoAlmacenService } from '../../product/service/productoAlmacen.service';
import { AsignarProductoAlmacenService } from '../../AsignarProducto/asignar-producto-almacen.service';

@Component({
  selector: 'app-almacen-list',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './almacen-list.component.html',
  styleUrl: './almacen-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlmacenListComponent {
  @Input() public almacenes: Almacen[] = [];

  selectedAlmacenId!: number ;
  selectedAlmacen?: Almacen ;
  mensaje: string = '';

  constructor(
    private almacenService: AlmacenService,
    private asignarProductoAlmacen: AsignarProductoAlmacenService,
    private cdr: ChangeDetectorRef,
    private router:Router
  ) {}



  reloadAlmacenes(): void {
    this.almacenService.getAlmacenes().subscribe({
      next: (almacenes) => {
        this.almacenes = almacenes; // Actualiza la lista de productos
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.cdr.markForCheck();
      },
    });
  }
  onAlmacenChange() {
    console.log('',this.selectedAlmacenId);
    console.log('Almacenes:',this.almacenes);
    this.selectedAlmacen = this.almacenes.find(almacen => almacen.id  === Number(this.selectedAlmacenId));
    console.log('SelectedAlamacen:',this.selectedAlmacen);
    this.cdr.markForCheck();
  }

  crearAlmacen(){
    this.router.navigate(['/dashboard/almacen/add']);

  }

  eliminarProducto(productoId: number, almacenId: number) {

    console.log({productoId,almacenId})
    this.asignarProductoAlmacen.quitarProducto(productoId, almacenId).subscribe(
      (response) => {
        console.log(response);
        this.mensaje = response.message;
        this.reloadAlmacenes();
        alert( this.mensaje);
      },
      (error) => {
        // Si ocurre un error
        // if (error.error && error.error.message) {
          this.mensaje = error;
        // } else {
        //   this.mensaje = "Ocurrió un error inesperado.";
        // }
        console.error(error);


        this.cdr.markForCheck();
        alert(this.mensaje);
      }
    );
  }

}
