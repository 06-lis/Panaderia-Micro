import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PermisoService } from '../../permisos/permiso.service';
import { Permiso } from '../../../interfaces/permiso.interface';
import { CommonModule } from '@angular/common';
import { Rol } from '../../../interfaces/rol.interface';
import { RolService } from '../../rol/rol.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-rol-permisos',
  imports: [
    CommonModule
  ],
  templateUrl: './rol-permisos.component.html',
  styleUrl: './rol-permisos.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolPermisosComponent implements OnInit{
  permisos:Permiso[] = [];
  rol!:Rol;
  rolId!: number;
  selectedPermisos: Permiso[] | null = null;
  constructor(
    private permisoService: PermisoService,
    private rolService:RolService,
    private cdr: ChangeDetectorRef,
    private router: Router, // Inyectar Router
    private route: ActivatedRoute,
  ) { }
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
  }

  loadRol():void{

    this.rolService.getRolById(this.rolId).subscribe({
      next: (rol) => {
        this.rol = rol;
        console.log('Rol cargado:', this.rol);
        // Verificar si el rol tiene permisos asignados
        if (this.rol.rolPermisos) {
          this.selectedPermisos = this.permisos.filter(p =>
            this.rol.rolPermisos!.some(rp => rp.iD_Permiso === p.iD_Permiso)
          );
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
    this.selectedPermisos = this.selectedPermisos.filter(p => p.iD_Permiso !== permiso.iD_Permiso);
  }

  console.log('Permisos seleccionados:', this.selectedPermisos);
  }

  save(): void {
    if (!this.rol || !this.selectedPermisos) {
      console.warn('No hay permisos seleccionados o no hay información del rol.');
      return;
    }

    console.log('Permisos seleccionados:', this.selectedPermisos);

    // 🔹 1. Filtrar permisos nuevos (los que no tienen iD_Rol_Permiso aún)
    const permisosNuevos = this.selectedPermisos.filter(p =>
      !this.rol.rolPermisos?.some(rp => rp.iD_Permiso === p.iD_Permiso)
    );

    // 🔹 2. Filtrar permisos eliminados (los que tienen iD_Rol_Permiso y ya no están en la lista seleccionada)
    const permisosEliminados = this.rol.rolPermisos?.filter(rp =>
      !this.selectedPermisos?.some(p => p.iD_Permiso === rp.iD_Permiso)
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
      rolPermisos: permisosNuevos.map(p => ({
        iD_Rol: this.rol.iD_Rol,
        iD_Permiso: p.iD_Permiso,
      })),
    };

    console.log('Datos a enviar:', rolData);

    // 🔹 4. Insertar nuevos permisos
  if (permisosNuevos.length > 0) {
      rolData.rolPermisos.forEach(permiso => {
        this.rolService.createRolPerimo(permiso).subscribe(
          response => console.log('Permiso insertado:', response),
          error => console.error('Error al insertar permiso:', error)
        );
      });
  }

  // 🔹 5. Eliminar permisos deseleccionados (usando iD_Rol_Permiso)
  if (permisosEliminados.length > 0) {
    const idsEliminar = permisosEliminados.map(p => p.iD_Rol_Permiso);
    idsEliminar.forEach(id => {
      this.rolService.deleteRolPermisos(id).subscribe(
        response => console.log('Permiso eliminado con éxito.', response),
        error => console.error('Error al eliminar permiso:', error),
      );
    });
  }

  alert('Cambios guardados con éxito.');

  console.log('Datos a enviar:', rolData);
  }

  isSelected(permisoId: number): boolean {

    return this.selectedPermisos
    ? this.selectedPermisos.some(p => p.iD_Permiso === permisoId)
    : false;
  }

}
