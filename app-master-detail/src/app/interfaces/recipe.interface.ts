export interface DetalleReceta {
  id?: number;
  recetaId?: number;
  insumoId: number;
  cantidadRequerida: number;
  nombreInsumo?: string; // Campo auxiliar para UI
}

export interface Receta {
  id?: number;
  nombre: string;
  descripcion: string;
  productoId: number;
  cantidadRequerida: number;
  detalles: DetalleReceta[];
  nombreProducto?: string; // Campo auxiliar para UI
}
