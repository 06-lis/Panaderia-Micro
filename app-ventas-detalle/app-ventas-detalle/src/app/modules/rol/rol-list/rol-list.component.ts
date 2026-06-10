import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { Rol } from '../../../interfaces/rol.interface';
import { RolService } from '../rol.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-rol-list',
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './rol-list.component.html',
  styleUrl: './rol-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolListComponent {
  @Input() public roles: Rol[] = [];

  constructor(
    private rolesService: RolService,
    private cdr: ChangeDetectorRef,
    private router:Router
  ) {}

  deleteRol(rol_id: number): void {
    this.rolesService.deleteRol(rol_id).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'El rol ha sido eliminado exitosamente.',
          confirmButtonText: 'OK',
        }).then(() => {
          // Recargar la lista de productos
          this.reloadRoles();
        });
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al eliminar el rol. Inténtalo de nuevo.',
          confirmButtonText: 'Entendido',
        });
        this.cdr.markForCheck();
      },
    });
  }

  reloadRoles(): void {
    this.rolesService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles; // Actualiza la lista de productos
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.cdr.markForCheck();
      },
    });
  }

  createRole():void{
    this.router.navigate(['/dashboard/roles/add']);
  }
}
