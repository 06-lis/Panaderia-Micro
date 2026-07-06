import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from '../service/customer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from '../../../interfaces/customer.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-edit',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './customer-edit.component.html',
  styleUrl: './customer-edit.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerEditComponent implements OnInit{

  customerForm!: FormGroup;
  errorMessage: string = '';
  customerId!: number;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      celular: ['', Validators.required],
    });

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.customerId = +idParam;
        this.loadCustomer();
      }
    });
  }

  loadCustomer(): void {
    this.customerService.getCustomerById(this.customerId).subscribe({
      next: (customer) => {
        if (customer && !Array.isArray(customer)) {
          this.customerForm.patchValue({
            nombre: customer.nombre,
            apellidos: customer.apellidos,
            celular: customer.celular
          });
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('Error cargando cliente', err);
        this.errorMessage = 'Hubo un error al cargar los datos del cliente.';
        this.cdr.markForCheck();
      }
    });
  }

  onSubmit(): void {
    if (this.customerForm.valid) {
      const customer: Customer = {
        id: this.customerId,
        customerId: this.customerId,
        ...this.customerForm.value
      };
      
      this.customerService.updateCustomer(customer).subscribe(
        (response) => {
          console.log('Cliente actualizado exitosamente', response);
          this.router.navigate(['/dashboard/customer/list']);
        },
        (error) => {
          this.errorMessage = 'Hubo un error al actualizar el cliente';
          console.error(error);
          this.cdr.markForCheck();
        }
      );
    } else {
      this.errorMessage = 'Por favor, complete todos los campos correctamente';
      this.cdr.markForCheck();
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/customer/list']);
  }
}
