import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';
import { User } from '../../../interfaces/user.interface';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../usuario.service';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-usuario-list',
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuarioListComponent {
  @Input() public users: User[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    private router:Router
  ) {}

  deleteUser(user_id: number): void {
    this.usuarioService.deleteUsuario(user_id).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'El usuario ha sido eliminado exitosamente.',
          confirmButtonText: 'OK',
        }).then(() => {
          // Recargar la lista de productos
          this.reloadProducts();
        });
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al eliminar el usuario. Inténtalo de nuevo.',
          confirmButtonText: 'Entendido',
        });
        this.cdr.markForCheck();
      },
    });
  }

  reloadProducts(): void {
    this.usuarioService.getUsuarios().subscribe({
      next: (users) => {
        this.users = users; // Actualiza la lista de productos
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.cdr.markForCheck();
      },
    });
  }
  createUser(){
    this.router.navigate(['/dashboard/user/add']);
  }
}
