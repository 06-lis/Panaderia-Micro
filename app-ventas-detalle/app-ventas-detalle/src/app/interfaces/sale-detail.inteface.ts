import { ProductoAlmacen } from "./producto-almacen,interface,";
import { Sale } from "./sale.interface";

export interface SaleDetail {
  /// detalle de venta
  id?: number;
  productoAlmacenId?: number;
  productoAlmacen?: ProductoAlmacen;
  ventaId?: number;
  venta?: Sale;
  cantidad?: number;
  monto?: number;
  //anterrior
  saleDetailId?: number;
  saleId?: number;
  productId?: number;
  salePrice?: number;
  quantity?: number;
}
