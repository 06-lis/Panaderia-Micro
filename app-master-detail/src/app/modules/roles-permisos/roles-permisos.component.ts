import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RolListComponent } from "../rol/rol-list/rol-list.component";
import { Rol } from '../../interfaces/rol.interface';
import { RolService } from './rol.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PermisoService } from '../permisos/permiso.service';
import { Permiso } from '../../interfaces/permiso.interface';

@Component({
  selector: 'app-roles-permisos',
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './roles-permisos.component.html',
  styleUrl: './roles-permisos.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesPermisosComponent implements OnInit {

  roles: Rol[] = [];
  permisos: Permiso[] = [];

  constructor(
    private rolesService: RolService,
    private permisosService: PermisoService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.reloadPermisos();
  }

  // Primero, cargamos los permisos
  reloadPermisos(): void {
    this.permisosService.getPermisos().subscribe({
      next: (data) => {
        this.permisos = data;
        console.log('Permisos cargados:', this.permisos);

        // Una vez que los permisos están cargados, cargamos los roles
        this.reloadRoles();
      },
      error: (err) => {
        console.error('Error al cargar los permisos:', err);
        this.cdr.markForCheck();
      }
    });
  }

  // Después cargamos los roles, y asignamos los permisos correspondientes
  reloadRoles(): void {
    this.rolesService.getRoles().subscribe({
      next: (roles) => {
        // Mapear los roles para incluir el nombre del permiso en lugar del ID
        this.roles = roles.map(rol => ({
          ...rol,
          rolPermisos: rol.rolPermisos?.map(permiso => ({
            ...permiso,
            nombrePermiso: this.permisos.find(p => p.iD_Permiso === permiso.iD_Permiso)?.nombre_Permiso
          }))
        }));

        console.log('Roles con nombres de permisos:', this.roles);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar los roles:', err);
        this.cdr.markForCheck();
      }
    });
  }
}
