import { Proveedor } from './proveedor.interface';

export interface DetalleCompra {
  idAlmacen: number;
  idItem: number;
  cantidad: number;
  precio: number;
  // campos enriquecidos para mostrar en la UI
  nombreItem?: string;
  subtotal?: number;
}

export interface NotaCompra {
  id: string;              // ObjectId MongoDB
  idNotaCompra: number;
  fechaCompra: string;
  montoTotal: number;
  estado: string;          // 'Completada', 'Pendiente', 'Cancelada'
  idEmpleado: number;
  idProveedor: number;
  detalles: DetalleCompra[];
  // Campo enriquecido (join manual desde frontend)
  proveedor?: Proveedor;
}

export interface CreateNotaCompraDto {
  idProveedor: number;
  idEmpleado: number;
  estado: string;
  detalles: {
    idAlmacen: number;
    idItem: number;
    cantidad: number;
    precio: number;
  }[];
}
