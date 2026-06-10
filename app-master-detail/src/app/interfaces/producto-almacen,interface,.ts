import { Almacen } from "./almacen.interface";
import { Product } from "./poduct.interface";

export interface ProductoAlmacen {
  id?: number;
  productoId?: number;
  producto?: Product;
  item?: Product;
  almacenId?: number;
  almacen?: Almacen;
  stock: number;
}
