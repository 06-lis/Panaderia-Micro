import { Almacen } from "./almacen.interface";
import { Product } from "./poduct.interface";
import { ProductoAlmacen } from "./producto-almacen,interface,"



export interface CartVenta {
  /// detalle de venta
  productoAlmacenId:number;
  ventaId?: number;
  cantidad?: number;
  monto?: number;
  producto:Product;
  alamacen:Almacen;
}
