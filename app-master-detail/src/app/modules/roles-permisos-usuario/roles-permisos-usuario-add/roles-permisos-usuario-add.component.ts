import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { User } from '../../../interfaces/user.interface';
import { Rol } from '../../../interfaces/rol.interface';
import { UsuarioService } from '../../usuario/usuario.service';
import { RolService } from '../../rol/rol.service';
import { PermisoService } from '../../permisos/permiso.service';
import { Permiso } from '../../../interfaces/permiso.interface';
import { RolPermisoUsuario } from '../../../interfaces/rol-permiso-usuario.interface';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-roles-permisos-usuario-add',
  imports: [
    CommonModule, RouterModule, FormsModule
  ],
  templateUrl: './roles-permisos-usuario-add.component.html',
  styleUrl: './roles-permisos-usuario-add.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesPermisosUsuarioAddComponent implements OnInit {
  user: User | undefined;
  userId!: number;

  roles: Rol[] = [];
  permisos: Permiso[] = [];
  selectedRolId: number | null = null;
  activeRolPermisoIds: number[] = [];
  searchQuery: string = '';

  get allRolPermisos(): any[] {
    const list: any[] = [];
    this.roles.forEach(rol => {
      if (rol.rolPermisos) {
        rol.rolPermisos.forEach(rp => {
          if (!list.some(item => item.iD_Rol_Permiso === rp.iD_Rol_Permiso)) {
            list.push({
              ...rp,
              nombreRol: rol.nombre_Rol
            });
          }
        });
      }
    });
    return list.sort((a, b) => (a.nombrePermiso || '').localeCompare(b.nombrePermiso || ''));
  }

  get filteredRolPermisos(): any[] {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      return this.allRolPermisos;
    }
    return this.allRolPermisos.filter(rp =>
      rp.nombrePermiso?.toLowerCase().includes(query) ||
      rp.nombreRol?.toLowerCase().includes(query)
    );
  }

  selectAll(): void {
    this.activeRolPermisoIds = this.allRolPermisos.map(rp => rp.iD_Rol_Permiso!);
    this.cdr.markForCheck();
  }

  deselectAll(): void {
    this.activeRolPermisoIds = [];
    this.cdr.markForCheck();
  }

  restoreDefault(): void {
    if (this.selectedRolId) {
      this.onRoleSelect();
    } else {
      this.activeRolPermisoIds = [];
      this.cdr.markForCheck();
    }
  }

  constructor(
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private permisosService: PermisoService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userId = +this.route.snapshot.paramMap.get('id')!;
    this.loadData();
  }

  loadData(): void {
    // 1. Cargar permisos globales
    this.permisosService.getPermisos().subscribe({
      next: (permisosData) => {
        this.permisos = permisosData;

        // 2. Cargar roles con sus mapeos de permisos
        this.rolService.getRoles().subscribe({
          next: (rolesData) => {
            this.roles = rolesData.map(rol => ({
              ...rol,
              rolPermisos: rol.rolPermisos?.map(rp => ({
                ...rp,
                nombrePermiso: this.permisos.find(p => p.iD_Permiso === rp.iD_Permiso)?.nombre_Permiso
              }))
            }));
            this.cdr.markForCheck();
          },
          error: (err) => console.error(err)
        });

        // 3. Cargar la información del usuario
        this.usuarioService.getUsuarioById(this.userId).subscribe({
          next: (userData) => {
            this.user = userData;
            this.cdr.markForCheck();
          },
          error: (err) => console.error(err)
        });

        // 4. Cargar los permisos asignados actualmente al usuario
        this.rolService.getRolPermisoUsuario().subscribe({
          next: (links) => {
            const userLinks = links.filter(x => x.userId === this.userId);
            this.activeRolPermisoIds = userLinks.map(x => x.iD_Rol_Permiso);
            console.log('Permisos activos del usuario:', this.activeRolPermisoIds);
            this.cdr.markForCheck();
          },
          error: (err) => console.error(err)
        });
      },
      error: (err) => console.error(err)
    });
  }

  isPermissionSelected(idRolPermiso: number): boolean {
    return this.activeRolPermisoIds.includes(idRolPermiso);
  }

  togglePermission(idRolPermiso: number, event: any): void {
    const checked = event.target.checked;
    if (checked) {
      if (!this.activeRolPermisoIds.includes(idRolPermiso)) {
        this.activeRolPermisoIds.push(idRolPermiso);
      }
    } else {
      this.activeRolPermisoIds = this.activeRolPermisoIds.filter(id => id !== idRolPermiso);
    }
  }

  onRoleSelect(): void {
    if (this.selectedRolId) {
      const selectedRole = this.roles.find(r => r.iD_Rol === +this.selectedRolId!);
      if (selectedRole && selectedRole.rolPermisos) {
        // Marcamos los del rol seleccionado
        this.activeRolPermisoIds = selectedRole.rolPermisos.map(rp => rp.iD_Rol_Permiso!);
        console.log('Cargados permisos por defecto del rol:', selectedRole.nombre_Rol, this.activeRolPermisoIds);
        this.cdr.markForCheck();
      }
    }
  }

  save(): void {
    // 1. Eliminar los permisos anteriores del usuario
    this.rolService.deleteRolUsuarioByUserId(this.userId).subscribe({
      next: () => {
        // 2. Si hay nuevos permisos seleccionados, crearlos
        if (this.activeRolPermisoIds.length > 0) {
          const requests = this.activeRolPermisoIds.map(id => {
            const payload: RolPermisoUsuario = {
              userId: this.userId,
              iD_Rol_Permiso: id
            };
            return this.rolService.createRolUsuario(payload);
          });

          forkJoin(requests).subscribe({
            next: () => {
              alert('Cambios guardados con éxito.');
              this.router.navigate(['/dashboard/roles-permisos-usuario']);
            },
            error: (err) => {
              console.error('Error al asignar permisos:', err);
              alert('Ocurrió un error al guardar los permisos.');
            }
          });
        } else {
          alert('Cambios guardados con éxito (se quitaron todos los permisos).');
          this.router.navigate(['/dashboard/roles-permisos-usuario']);
        }
      },
      error: (err) => {
        console.error('Error al limpiar permisos anteriores:', err);
        alert('Ocurrió un error al limpiar los permisos anteriores.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/roles-permisos-usuario']);
  }
}
