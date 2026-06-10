import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsignarProductoAlmacenService } from './asignar-producto-almacen.service';
import { ItemService } from '../crear-item/service/item.service';
import { AlmacenService } from '../almacen/service/almacen.service';
import { Almacen } from '../../interfaces/almacen.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asignar-producto',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './AsignarProducto.component.html',
  styleUrl: './AsignarProducto.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsignarProductoComponent implements OnInit {
  asignarForm!: FormGroup;
  almacenes: Almacen[] = [];
  itemsList: any[] = []; // Contiene todos los productos e insumos
  mensaje: string = '';

  constructor(
    private fb: FormBuilder,
    private asignarProductoAlmacenService: AsignarProductoAlmacenService,
    private itemService: ItemService,
    private almacenService: AlmacenService,
    private cdr: ChangeDetectorRef,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.asignarForm = this.fb.group({
      AlmacenId: [null, Validators.required],
      Items: this.fb.array([])
    });

    this.agregarFila();

    // Cargar Items (Productos e Insumos)
    this.itemService.getItems().subscribe({
      next: (items) => {
        this.itemsList = items;
        console.log('Items cargados (Productos/Insumos):', this.itemsList);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar items:', err);
      }
    });

    // Cargar Almacenes
    this.almacenService.getAlmacenes().subscribe({
      next: (almacenes) => {
        this.almacenes = almacenes;
        console.log('Almacenes cargados:', this.almacenes);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar almacenes:', err);
      }
    });
  }

  get itemsFormArray(): FormArray {
    return this.asignarForm.get('Items') as FormArray;
  }

  crearFilaItem(): FormGroup {
    return this.fb.group({
      ItemId: [null, Validators.required],
      Stock: [null, [Validators.required, Validators.min(1)]]
    });
  }

  agregarFila(): void {
    this.itemsFormArray.push(this.crearFilaItem());
    this.cdr.markForCheck();
  }

  eliminarFila(index: number): void {
    if (this.itemsFormArray.length > 1) {
      this.itemsFormArray.removeAt(index);
    } else {
      this.itemsFormArray.at(0).reset();
    }
    this.cdr.markForCheck();
  }

  // Verifica si un item ya ha sido seleccionado en otra fila para evitar duplicados en la pantalla
  isItemSeleccionado(itemId: number, currentIndex: number): boolean {
    const selectedItems = this.itemsFormArray.value as { ItemId: any }[];
    return selectedItems.some((val, idx) => val.ItemId && Number(val.ItemId) === Number(itemId) && idx !== currentIndex);
  }

  goBack(): void {
    this.location.back();
  }

  onSubmit() {
    if (this.asignarForm.invalid) {
      this.asignarForm.markAllAsTouched();
      return;
    }

    const formValue = this.asignarForm.value;
    const bulkPayload = {
      AlmacenId: Number(formValue.AlmacenId),
      Items: formValue.Items.map((item: any) => ({
        ItemId: Number(item.ItemId),
        Stock: Number(item.Stock)
      }))
    };

    console.log('Payload a enviar:', bulkPayload);

    Swal.fire({
      title: '¿Confirmar asignaciones?',
      text: 'Se registrará el stock de todos los items seleccionados en el almacén.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8E4E2A',
      cancelButtonColor: '#E6DCD3',
      confirmButtonText: 'Sí, asignar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Guardando asignaciones...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.asignarProductoAlmacenService.addBulkProductoToAlmacen(bulkPayload).subscribe({
          next: (response) => {
            Swal.close();
            Swal.fire({
              title: '¡Asignado con éxito!',
              text: response.mensaje || 'Se han asignado todos los items correctamente.',
              icon: 'success',
              confirmButtonColor: '#8E4E2A'
            }).then(() => {
              this.itemsFormArray.clear();
              this.agregarFila();
              this.asignarForm.get('AlmacenId')?.reset();
              this.cdr.markForCheck();
            });
          },
          error: (error) => {
            Swal.close();
            Swal.fire({
              title: 'Error al asignar',
              text: error || 'Ocurrió un error inesperado al procesar la asignación.',
              icon: 'error',
              confirmButtonColor: '#8E4E2A'
            });
            this.cdr.markForCheck();
          }
        });
      }
    });
  }
}
