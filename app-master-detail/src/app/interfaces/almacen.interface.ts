import { Category } from "./category.interface";
import { Product } from "./poduct.interface";

// Modelo de Producto
export interface Almacen {
  id?: number,
  nombre: string,
	locacion: string,
  tipo?: string,
  capacidadMaxima?: number,
  productos:Product[]
}
