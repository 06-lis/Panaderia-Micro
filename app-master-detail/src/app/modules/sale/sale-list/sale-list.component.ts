import { ChangeDetectionStrategy,ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { Sale } from '../../../interfaces/sale.interface';
import { SaleService } from '../service/sale.service';
import { CustomerService } from '../../customer/service/customer.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Customer } from '../../../interfaces/customer.interface';
import { SaleDetailService } from '../service/SaleDetail.service';
import { SaleDetail } from '../../../interfaces/sale-detail.inteface';
import { UsuarioService } from '../../usuario/usuario.service';
import { User } from '../../../interfaces/user.interface';

@Component({
  selector: 'app-sale-list',
  imports: [CommonModule,RouterModule],
  templateUrl: './sale-list.component.html',
  styleUrl: './sale-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleListComponent implements OnInit{
  // sales: Sale[] = [];
  sales = signal<Sale[]>([]);
  user = signal<User | null>(null);
  saleDetail = signal<SaleDetail[]>([]);
  customer!:Customer;
  selectedSale: Sale | null = null;
  selectedSaleDetail: SaleDetail[] | null = null;

  constructor(
    private salesService: SaleService,
    private saleDetailService: SaleDetailService,
    private customerService: CustomerService,
    private usuarioService: UsuarioService,

    private cdr: ChangeDetectorRef,
    private router: Router // Inyectar Router
  ) {}

  ngOnInit(): void {
    this.salesService.getSalesAll().subscribe(
      (data: Sale[]) => {
      // this.sales = data;
      this.sales.set(data);
      console.log(this.sales());
      const salesData = this.sales();
      if (salesData.length > 0) {
        this.selectSale(salesData[salesData.length - 1]);
        this.cdr.markForCheck();
      }
      this.cdr.markForCheck();
      // this.cdr.markForCheck();
    });
    console.log('Ventas:', this.sales);
  }

  selectSale(sale: Sale) {
    this.selectedSale = sale;
    // Obtener el usuarioId del objeto sale
    const userId = sale.usuarioId;

    // Llamar al servicio para obtener el usuario
    this.usuarioService.getUsuarioById(userId).subscribe(
      (usuario: User) => {
        this.user.set(usuario); // Suponiendo que estás manejando un array de usuarios, si solo es un único usuario, puedes usar `this.user.set(usuario)`.
        console.log('Usuario:', usuario);
      },
      (error) => {
        console.error('Error al obtener usuario:', error);
      }
    );

    this.saleDetailService.getDetallesPorVenta(sale.id).subscribe(
      (data: SaleDetail[]) => {
      // this.sales = data;
      this.saleDetail.set(data);
      console.log('Detalle de Venta: ',this.saleDetail());
      const salesData = this.saleDetail();
      this.selectedSaleDetail = salesData;
      console.log('selectedSaleDetail :',salesData);
      this.cdr.markForCheck();
    });

    console.log('this.saleDetail() :',this.saleDetail());
  }

  getCustomerName(customer_id:number):void{
      // this.customerService.getCustomerById(customer_id).subscribe((data) => {
      //   this.customer=data; // Rellena el formulario con los datos del cliente
      // });
      // r
    }

  removeSale(saleId: number): void {
    this.salesService.deleteSale(saleId).subscribe(
      () => {
        const updatedSales = this.sales().filter((sale) => sale.saleId !== saleId);
        this.sales.set(updatedSales);
        const salesData = this.sales();
        if (salesData.length > 0) {
          this.selectSale(salesData[salesData.length - 1]);
        } else {
          // this.selectedSale = null;
        }
        console.log('Venta eliminada exitosamente');
      },
      (error) => {
        console.error('Error al eliminar la venta', error);
      }
    );
  }

  createNewSale(): void {
    this.router.navigate(['/dashboard/sale/add']);
    // this.router.navigate(['/create']); // Redirige a la ruta /create
  }
}
