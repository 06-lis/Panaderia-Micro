// Proveedor en MongoDB - puede ser Persona o Empresa
export interface Proveedor {
  id: string;           // ObjectId de MongoDB
  idProveedor: number;
  tipoProveedor: 'Persona' | 'Empresa';
  telefono: string;
  direccion: string;
  correo: string;
  nombre?: string;       // Solo para TipoProveedor = 'Persona'
  razonSocial?: string;  // Solo para TipoProveedor = 'Empresa'
}

export interface CreateProveedorDto {
  tipoProveedor: 'Persona' | 'Empresa';
  telefono: string;
  direccion: string;
  correo: string;
  nombre?: string;
  razonSocial?: string;
}

// Helper: obtiene el nombre para mostrar
export function getProveedorNombre(p: Proveedor): string {
  return p.tipoProveedor === 'Empresa' ? (p.razonSocial ?? '') : (p.nombre ?? '');
}
