import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Permiso } from '../../../interfaces/permiso.interface';
import { Rol } from '../../../interfaces/rol.interface';
import { PermisoService } from '../../permisos/permiso.service';
import { RolService } from '../rol.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-roles-permisos-add',
  imports: [CommonModule],
  templateUrl: './roles-permisos-add.component.html',
  styleUrl: './roles-permisos-add.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesPermisosAddComponent implements OnInit {
  permisos: Permiso[] = [];
  rol!: Rol;
  rolId!: number;
  selectedPermisos: Permiso[] | null = null;
  constructor(
    private permisoService: PermisoService,
    private rolService: RolService,
    private cdr: ChangeDetectorRef,
    private router: Router, // Inyectar Router
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.rolId = +this.route.snapshot.paramMap.get('id')!;
    this.loadPermisos();
    this.loadRol();
  }

  loadPermisos(): void {
    this.permisoService.getPermisos().subscribe({
      next: (permisos) => {
        this.permisos = permisos;
        console.log('Permisos cargados:', this.permisos);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
      },
    });
    this.cdr.markForCheck();
  }

  loadRol(): void {
    this.rolService.getRolById(this.rolId).subscribe({
      next: (rol) => {
        this.rol = rol;
        console.log('Rol cargado:', this.rol);
        // Verificar si el rol tiene permisos asignados
        // Verificar si el rol tiene permisos asignados
        if (this.rol.rolPermisos) {
          this.selectedPermisos = this.permisos.filter((p) =>
            this.rol.rolPermisos!.some((rp) => rp.iD_Permiso === p.iD_Permiso)
          );
        } else {
          this.selectedPermisos = [];
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  addPermission(permiso: Permiso, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    // Asegurar que selectedPermisos esté inicializado
    if (!this.selectedPermisos) {
      this.selectedPermisos = [];
    }

    if (isChecked) {
      this.selectedPermisos.push(permiso);
    } else {
      this.selectedPermisos = this.selectedPermisos.filter(
        (p) => p.iD_Permiso !== permiso.iD_Permiso
      );
    }

    console.log('Permisos seleccionados:', this.selectedPermisos);
  }

  save(): void {
    if (!this.rol || !this.selectedPermisos) {
      console.warn(
        'No hay permisos seleccionados o no hay información del rol.'
      );
      return;
    }

    console.log('Permisos seleccionados:', this.selectedPermisos);

    // 🔹 1. Filtrar permisos nuevos (los que no tienen iD_Rol_Permiso aún)
    const permisosNuevos = this.selectedPermisos.filter(
      (p) => !this.rol.rolPermisos?.some((rp) => rp.iD_Permiso === p.iD_Permiso)
    );

    // 🔹 2. Filtrar permisos eliminados (los que tienen iD_Rol_Permiso y ya no están en la lista seleccionada)
    const permisosEliminados =
      this.rol.rolPermisos?.filter(
        (rp) =>
          !this.selectedPermisos?.some((p) => p.iD_Permiso === rp.iD_Permiso)
      ) || [];

    if (permisosNuevos.length === 0 && permisosEliminados.length === 0) {
      alert('No hay cambios en los permisos.');
      return;
    }

    console.log('Permisos nuevos a insertar:', permisosNuevos);
    console.log('Permisos eliminados a borrar:', permisosEliminados);

    // 🔹 3. Construcción del objeto para la API
    const rolData = {
      iD_Rol: this.rol.iD_Rol,
      nombre_Rol: this.rol.nombre_Rol,
      descripcion: this.rol.descripcion,
      fecha_Creacion: this.rol.fecha_Creacion || new Date().toISOString(), // Usa la fecha existente si hay
      rolPermisos: permisosNuevos.map((p) => ({
        iD_Rol: this.rol.iD_Rol,
        iD_Permiso: p.iD_Permiso,
      })),
    };

    console.log('Datos a enviar:', rolData);

    const observables: any = [];

    if (permisosNuevos.length > 0) {
      permisosNuevos.forEach((permiso) => {
        const rolPermiso = {
          iD_Rol: this.rol.iD_Rol,
          iD_Permiso: permiso.iD_Permiso,
        };
        observables.push(this.rolService.createRolPerimo(rolPermiso));
      });
    }

    if (permisosEliminados.length > 0) {
      permisosEliminados.forEach((p) => {
        observables.push(this.rolService.deleteRolPermisos(p.iD_Rol_Permiso));
      });
    }

    Promise.all(observables.map((obs: Observable<any>) => obs.toPromise()))
      .then(() => {
        alert('✅ Cambios guardados con éxito.');
        this.router.navigate(['/dashboard/roles-permisos']); // Redirigir a la vista deseada
      })
      .catch((error) => {
        console.error('Error al guardar cambios:', error);
      });
  }

  isSelected(permisoId: number): boolean {
    return this.selectedPermisos
      ? this.selectedPermisos.some((p) => p.iD_Permiso === permisoId)
      : false;
  }

  goBack() {
    this.router.navigate(['/dashboard/roles-permisos']);
  }
}
