import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UsuarioAddComponent } from './usuario-add/usuario-add.component';
import { UsuarioListComponent } from './usuario-list/usuario-list.component';
import { User } from '../../interfaces/user.interface';
import { UsuarioService } from './usuario.service';

@Component({
  selector: 'app-usuario',
  imports: [

    UsuarioListComponent
  ],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuarioComponent implements OnInit{
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
