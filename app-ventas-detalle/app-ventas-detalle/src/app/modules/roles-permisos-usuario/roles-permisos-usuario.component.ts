import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { User } from '../../interfaces/user.interface';
import { UsuarioService } from '../usuario/usuario.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-roles-permisos-usuario',
  imports: [

    CommonModule,
    RouterLink
  ],
  templateUrl: './roles-permisos-usuario.component.html',
  styleUrl: './roles-permisos-usuario.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesPermisosUsuarioComponent implements OnInit{
  errorMessage: string | null = null;
    users: User[] = [];
    constructor(
        private userService:UsuarioService,
        private cdr: ChangeDetectorRef
      ){}
      ngOnInit(): void {
        this.loadUsers();
      }

      loadUsers():void{
        this.userService.getUsuarios().subscribe(
          (data) => {
            this.users = data;
            console.log('Usuarios cargados:', this.users);
            this.errorMessage = null;
            this.cdr.markForCheck();
          },
          (error) => {
            this.errorMessage = 'Hubo un error al cargar los usuarios';
            this.cdr.markForCheck();
          }
        );
      }
 }
