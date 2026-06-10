import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { UsuarioService } from '../../usuario/usuario.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RolService } from '../rol.service';
import { User } from '../../../interfaces/user.interface';
import { Rol } from '../../../interfaces/rol.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolPermisoUsuario } from '../../../interfaces/rol-permiso-usuario.interface';

@Component({
  selector: 'app-rol-permiso-usuario',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './rol-permiso-usuario.component.html',
  styleUrl: './rol-permiso-usuario.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolPermisoUsuarioComponent implements OnInit {
  user: User | undefined;
  userId!: number;

  selectedUser: number | null = null; // Usuario seleccionado
  selectedRoles: any[] = []; // Roles seleccionados
  asignaciones: any[] = []; // Asignaciones de usuario-rol

  roles: Rol[] = [];
  constructor(
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private cdr: ChangeDetectorRef,
    private router: Router, // Inyectar Router
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.userId = +this.route.snapshot.paramMap.get('id')!;
    this.loadUsuario();
    this.loadRoles();
  }

  loadUsuario(): void {
    this.usuarioService.getUsuarioById(this.userId).subscribe({
      next: (usuarios) => {
        this.user = usuarios;
        console.log('Usuarios cargados:', this.user);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.cdr.markForCheck();
      },
    });
  }

  loadRoles(): void {
    this.rolService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        console.log('Roles cargados:', roles);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.cdr.markForCheck();
      },
    });
  }

  asignarRoles() {
    if (this.selectedUser && this.selectedRoles.length > 0) {
      this.selectedRoles.forEach((rol) => {
        this.asignaciones.push({
          userId: this.selectedUser,
          rol,
        });
      });

      console.log('Asignaciones:', this.asignaciones);
    } else {
      alert('Selecciona un usuario y al menos un rol.');
    }
  }

  transformarDatos(userId: number, data: any[]): any {
    return {
      userId: userId,
      rolpermiso: data
        // .filter(item => item.userId === userId) // Filtramos por el userId específico
        .flatMap((item) => item.rol.rolPermisos) // Extraemos los permisos
        .map((permiso) => ({ iD_Rol_Permiso: permiso.iD_Rol_Permiso })), // Formateamos
    };
  }

  save(): void {
    // 🔹 3. Construcción del objeto para la API
    const rolData = this.transformarDatos(this.userId, this.asignaciones);

    console.log('Datos a enviar:', rolData.rolpermiso);

    // 🔹 4. Insertar nuevos permisos
    if (rolData.rolpermiso.length > 0) {
      rolData.rolpermiso.forEach((permiso: any) => {
        var rolpermisoUsuario: RolPermisoUsuario = {
          userId: this.userId,
          iD_Rol_Permiso: permiso.iD_Rol_Permiso,
        };

        console.log('Datos a enviar rolpermisoUsuario:', rolpermisoUsuario);

        this.rolService.createRolUsuario(rolpermisoUsuario).subscribe(
          (response) => console.log('Permiso insertado:', response),
          (error) => console.error('Error al insertar permiso:', error)
        );
      });
    }

  }
}
