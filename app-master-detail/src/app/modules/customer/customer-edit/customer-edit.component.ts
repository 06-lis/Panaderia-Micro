import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from '../service/customer.service';
import { ActivatedRoute, Router } from '@angular/router';
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
export class CustomerEditComponent { 

  customerForm: FormGroup;
  customerId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private customerService: CustomerService,
    private router: Router // Inyectar Router
  ) {
    this.customerForm = this.fb.group({
      customerId: [null, Validators.required],
      firstName: ['', Validators.required],
      pSurname: ['', Validators.required],
      mSurname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      company: [''],
      phone: ['', Validators.required],
      address: [''],
      type: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Obtener el ID del cliente de la URL
    this.customerId = +this.route.snapshot.paramMap.get('id')!;

    // Cargar los datos del cliente
    this.customerService.getCustomerById(this.customerId).subscribe((data) => {
      this.customerForm.patchValue(data); // Rellena el formulario con los datos del cliente
    });
  }

  onSubmit() {
    if (this.customerForm.valid) {
      const customerId = this.customerForm.value.customerId;
      const customerData = { ...this.customerForm.value };
      //customerData.customerId; // Elimina `customerId` del cuerpo si no es requerido.

      this.customerService.updateCustomer(customerData).subscribe({
        next: (response: any) => {
          console.log('Cliente actualizado:', response);
          alert('Cliente actualizado exitosamente.');
          this.router.navigate(['/dashboard/customer/list']); // Redirigir a la lista de clientes
        },
        error: (err: any) => {
          console.error('Error al actualizar cliente:', err);
          alert('Error al actualizar el cliente.');
        },
      });
    }
  }
}
