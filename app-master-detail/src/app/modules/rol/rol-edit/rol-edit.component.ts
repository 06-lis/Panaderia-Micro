import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolService } from '../rol.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Rol } from '../../../interfaces/rol.interface';

@Component({
  selector: 'app-rol-edit',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './rol-edit.component.html',
  styleUrl: './rol-edit.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolEditComponent implements OnInit {
  rolForm!: FormGroup;
  rolId!: number;

  constructor(
    private fb: FormBuilder,
    private rolService: RolService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.rolForm = this.fb.group({
      nombre_Rol: ['', [Validators.required, Validators.maxLength(30)]],
      descripcion: ['', [Validators.required, Validators.maxLength(30)]],
      fecha_Creacion: [''],
    });

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.rolId = +idParam;
        this.loadRol();
      }
    });
  }

  loadRol(): void {
    this.rolService.getRolById(this.rolId).subscribe({
      next: (rol) => {
        if (rol) {
          this.rolForm.patchValue({
            nombre_Rol: rol.nombre_Rol,
            descripcion: rol.descripcion,
            fecha_Creacion: rol.fecha_Creacion
          });
          this.cdr.markForCheck();
        }
      },
      error: (err) => console.error('Error cargando rol', err)
    });
  }

  updateRol(): void {
    if (this.rolForm.valid) {
      const rol = this.rolForm.value;
      rol.iD_Rol = this.rolId; // Set the ID of the role to update
      
      this.rolService.updateRol(this.rolId, rol).subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Rol actualizado',
            text: 'El rol se ha actualizado exitosamente.',
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
            text: 'Hubo un problema al actualizar el rol. Inténtalo de nuevo.',
            confirmButtonText: 'OK'
          });
        }
      });
    } else {
      console.log('Formulario inválido');
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/roles']);
  }
}
