export interface DetalleProduccion {
  id?: number;
  produccionId?: number;
  detalleRecetaId?: number;
  almacenId: number;
  itemId: number;
  cantidad: number;
  tipoMovimiento: string; // 'Ingreso' o 'Egreso'
  nombreItem?: string; // Campo auxiliar para UI
}

export interface Produccion {
  id?: number;
  fechaProduccion?: string;
  cantidadProducida: number;
  empleadoSolicitaId: number;
  empleadoAutorizaId?: number;
  estado: string; // 'pendiente', 'aprobado', 'rechazado', 'cancelado'
  fechaSolicitud: string;
  fechaAutorizacion?: string;
  observaciones?: string;
  detalles?: DetalleProduccion[];
  nombreEmpleadoSolicita?: string; // Campo auxiliar para UI
  nombreEmpleadoAutoriza?: string; // Campo auxiliar para UI
}
