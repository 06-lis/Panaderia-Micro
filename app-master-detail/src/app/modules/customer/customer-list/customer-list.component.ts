import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CustomerService } from '../service/customer.service';
import { Customer } from '../../../interfaces/customer.interface';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-customer-list',
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerListComponent implements OnInit{
  constructor(
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef,
    private router: Router // Inyectar el router
  ) {}
  errorMessage: string | null = null;
  customers!: Customer[];
  ngOnInit(): void {
    this.loadCustomers();
  }
  loadCustomers(): void {
    // Muestra un mensaje inicial para indicar que se están cargando los datos
    console.log('Cargando clientes...');

    this.customerService.getCustomerAll().subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          this.customers = data;
          console.log('Clientes cargados exitosamente:', this.customers);
          this.errorMessage = null; // Limpia cualquier mensaje de error anterior
        } else {
          console.warn('No se encontraron clientes.');
          this.customers = [];
          this.errorMessage = 'No se encontraron clientes disponibles.';
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar los clientes:', error);
        this.errorMessage = 'Hubo un error al cargar los clientes. Por favor, inténtelo más tarde.';
        this.customers = []; // Limpia la lista de clientes si hay un error
        this.cdr.markForCheck();
      },
      complete: () => {
        console.log('Proceso de carga de clientes completado.');
      },
    });
  }


  updateCustomer(customer:Customer): void {
    // Lógica para actualizar el cliente
    console.log(`Actualizar cliente con ID: ${customer.customerId}`);
    // Puedes redirigir a una página de edición con el customerId
  }

  deleteCustomer(customerId: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      this.customerService.deleteCustomer(customerId).subscribe(
        (responce) => {
          this.customers = this.customers.filter(customer => customer.customerId !== customerId);
          this.loadCustomers();
          this.errorMessage = responce;
          this.cdr.markForCheck();
        },
        (error) => {
          this.errorMessage = error;
          this.cdr.markForCheck();
        }
      );
    }
  }
}
