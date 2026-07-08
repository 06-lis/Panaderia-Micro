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
  activeRolPermisoIds: number[] = [];
  searchQuery: string = '';
  expandedRoles: { [key: number]: boolean } = {};

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

  getGroupedRoles(): any[] {
    const query = this.searchQuery.toLowerCase().trim();
    return this.roles.map(rol => {
      const filteredPerms = (rol.rolPermisos || []).filter(rp => {
        if (!query) return true;
        return (rp.nombrePermiso || '').toLowerCase().includes(query) ||
               (rol.nombre_Rol || '').toLowerCase().includes(query);
      });
      return {
        ...rol,
        filteredPerms
      };
    }).filter(rol => rol.filteredPerms.length > 0);
  }

  onSearchQueryChange(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      this.roles.forEach(rol => {
        const hasMatch = (rol.rolPermisos || []).some(rp =>
          (rp.nombrePermiso || '').toLowerCase().includes(query) ||
          (rol.nombre_Rol || '').toLowerCase().includes(query)
        );
        if (hasMatch) {
          this.expandedRoles[rol.iD_Rol] = true;
        }
      });
    }
    this.cdr.markForCheck();
  }

  toggleRoleExpansion(roleId: number): void {
    this.expandedRoles[roleId] = !this.expandedRoles[roleId];
    this.cdr.markForCheck();
  }

  isRoleSelected(rol: any): boolean {
    if (!rol.rolPermisos || rol.rolPermisos.length === 0) return false;
    return rol.rolPermisos.every((rp: any) => this.activeRolPermisoIds.includes(rp.iD_Rol_Permiso!));
  }

  isRoleIndeterminate(rol: any): boolean {
    if (!rol.rolPermisos || rol.rolPermisos.length === 0) return false;
    const selectedCount = rol.rolPermisos.filter((rp: any) => this.activeRolPermisoIds.includes(rp.iD_Rol_Permiso!)).length;
    return selectedCount > 0 && selectedCount < rol.rolPermisos.length;
  }

  toggleRole(rol: any, event: any): void {
    const checked = event.target.checked;
    if (!rol.rolPermisos) return;

    const rpIds = rol.rolPermisos.map((rp: any) => rp.iD_Rol_Permiso!);
    if (checked) {
      rpIds.forEach((id: number) => {
        if (!this.activeRolPermisoIds.includes(id)) {
          this.activeRolPermisoIds.push(id);
        }
      });
    } else {
      this.activeRolPermisoIds = this.activeRolPermisoIds.filter(id => !rpIds.includes(id));
    }
    this.cdr.markForCheck();
  }

  isIndividualPermission(rol: any, rp: any): boolean {
    return this.isPermissionSelected(rp.iD_Rol_Permiso) && !this.isRoleSelected(rol);
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
    this.activeRolPermisoIds = [];
    this.cdr.markForCheck();
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
            
            // Expand active roles initially
            this.roles.forEach(rol => {
              const hasActivePerms = (rol.rolPermisos || []).some(rp => this.activeRolPermisoIds.includes(rp.iD_Rol_Permiso!));
              if (hasActivePerms) {
                this.expandedRoles[rol.iD_Rol] = true;
              }
            });
            
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
            
            // Also expand roles that contain active permissions
            if (this.roles.length > 0) {
              this.roles.forEach(rol => {
                const hasActivePerms = (rol.rolPermisos || []).some(rp => this.activeRolPermisoIds.includes(rp.iD_Rol_Permiso!));
                if (hasActivePerms) {
                  this.expandedRoles[rol.iD_Rol] = true;
                }
              });
            }
            
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
