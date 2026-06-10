import { Customer } from "./customer.interface";
import { SaleDetail } from "./sale-detail.inteface";
import { User } from "./user.interface";

export interface Sale {
  saleId?: number;
  CustomerName?:string;
  saleDate: string;
  totalAmount: number;
  customerId: number;
  usuario?:User;
  saleDetails: SaleDetail[];
  id: number;
  fecha: string;
  clienteId: number;
  cliente: Customer;
  usuarioId: number;
}
