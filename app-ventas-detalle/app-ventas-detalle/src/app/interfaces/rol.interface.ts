import { Permiso } from "./permiso.interface";
import { RolPermiso } from "./rol-permiso.interface";

export interface Rol {
  iD_Rol: number;
  nombre_Rol: string;
  descripcion?: string;
  fecha_Creacion?: string;
  permisos?: Permiso[];
  rolPermisos?: RolPermiso[];
  selected?: boolean; // Agregar la propiedad 'selected'
}
