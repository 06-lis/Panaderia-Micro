import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Almacen } from '../../../interfaces/almacen.interface';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlmacenService } from '../service/almacen.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-almacen-add',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './almacen-add.component.html',
  styleUrl: './almacen-add.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlmacenAddComponent {

  // @Input() almacen:Almacen[]=[];
    almacenForm!: FormGroup ;

    constructor(
      private fb: FormBuilder,
      private almacenService:AlmacenService,
      private router:Router
    ){}
    ngOnInit(): void {
      this.almacenForm = this.fb.group({
        nombre: ['', [Validators.required, Validators.maxLength(30)]],
        locacion: ['', [Validators.required, Validators.min(0.01)]],
    });
      // throw new Error('Method not implemented.');


    }

    createAlmacen(): void {
        if (this.almacenForm.valid) {
          const almacen = this.almacenForm.value;
          this.almacenService.addAlmacen(almacen).subscribe(
            {
              next: (response) => {
                Swal.fire({
                  icon: 'success',
                  title: 'Almacen creado',
                  text: 'El Almacen se ha creado exitosamente.',
                  confirmButtonText: 'OK'
                }).then(() => {
                  this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                    this.router.navigate(['/dashboard/almacen']); // Navega a la lista de productos
                  });
                });
              },
              error: (err) => {
                console.error(err);
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Hubo un problema al crear el almacen. Inténtalo de nuevo.',
                  confirmButtonText: 'OK'
                });
              }
            }
          );
        } else {
          console.log('Formulario inválido');
        }
      }
}
