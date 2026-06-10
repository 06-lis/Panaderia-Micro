import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from '../service/customer.service';
import { Router } from '@angular/router';
import { Customer } from '../../../interfaces/customer.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-add',
  imports: [
    FormsModule,
    ReactiveFormsModule, // Asegúrate de incluir esto
    CommonModule
  ],
  templateUrl: './customer-add.component.html',
  styleUrl: './customer-add.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CustomerAddComponent implements OnInit{

  customerForm!: FormGroup;  // Inicialización vacía
  errorMessage: string = ''; // Para manejar los errores

  constructor(
    private fb: FormBuilder, // Inyectar el FormBuilder
    private customerService: CustomerService, // Inyectar el servicio de cliente
    private router: Router // Inyectar el router
  ) {}

  ngOnInit(): void {
    // Definir el formulario con sus campos y validaciones
    this.customerForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      celular: ['', Validators.required],
    });
  }

   // Método para crear un cliente
   onSubmit(): void {
    if (this.customerForm.valid) {
      const customer: Customer= this.customerForm.value;
      this.customerService.createCustomer(customer).subscribe(
        (response) => {
          console.log('Cliente creado exitosamente', response);
          this.router.navigate(['/dashboard/customer/list']); // Redirigir a la lista de clientes
        },
        (error) => {
          this.errorMessage = 'Hubo un error al crear el cliente'; // Mostrar el error
          console.error(error);
        }
      );
    } else {
      this.errorMessage = 'Por favor, complete todos los campos correctamente'; // Mostrar mensaje si el formulario no es válido
    }
  }

  goBack():void{

    this.router.navigate(['/dashboard/customer/list']);
  }

 }
