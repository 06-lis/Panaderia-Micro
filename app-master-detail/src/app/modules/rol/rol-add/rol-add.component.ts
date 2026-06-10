import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolService } from '../rol.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-rol-add',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './rol-add.component.html',
  styleUrl: './rol-add.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolAddComponent {
  rolForm!: FormGroup ;

    constructor(
      private fb: FormBuilder,
      private rolService:RolService,
      private router:Router
    ){}
    ngOnInit(): void {
      this.rolForm = this.fb.group({
        nombre_Rol: ['', [Validators.required, Validators.maxLength(30)]],
        descripcion: ['', [Validators.required, Validators.maxLength(30)]],
        fecha_Creacion: [''],

      });
      // throw new Error('Method not implemented.');
    }

    // Método para enviar los datos del formulario
    createProduct(): void {
      if (this.rolForm.valid) {
        const rol = this.rolForm.value;
        rol.fecha_Creacion = new Date().toISOString(); // "2025-02-03T18:45:00.000Z"
        console.log('data para crear un rol:', rol);

        this.rolService.createRol(rol).subscribe(
          {
            next: (response) => {
              Swal.fire({
                icon: 'success',
                title: 'Rol creado',
                text: 'El rol se ha creado exitosamente.',
                confirmButtonText: 'OK'
              }).then(() => {
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                  this.router.navigate(['/dashboard/roles']);
                });
              });
            },
            error: (err) => {
              console.error(err);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al crear el rol. Inténtalo de nuevo.',
                confirmButtonText: 'OK'
              });
            }
          }
        );
      } else {
        console.log('Formulario inválido');
      }
    }

    goBack():void{


      this.router.navigate(['/dashboard/roles']);
    }
}
