import { Category } from "./category.interface";

// Modelo de Producto
export interface Product {
  idProducto?: number;
  id?: number;
  descripcion?: string;
  nombre?: string;
  precio: number;
  stock?: number;
  idCategoria?: number;
  id_Categoria?: number;
  id_categoria?: number;
  categoria?: Category;
  productoId?:number;
  nombreProducto?:string;
}
