import { ChangeDetectionStrategy, Component, Input, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../interfaces/user.interface';
import { UsuarioService } from '../usuario.service';
import { EmpleadoService } from '../empleado.service';
import { CustomerService } from '../../customer/service/customer.service';
import { Empleado } from '../../../interfaces/empleado.interface';
import { Customer } from '../../../interfaces/customer.interface';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuario-add',
  imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule
  ],
  templateUrl: './usuario-add.component.html',
  styleUrl: './usuario-add.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuarioAddComponent {
   @Input() user:User[]=[];
   userForm!: FormGroup ;
   empleados: Empleado[] = [];
   clientes: Customer[] = [];

   constructor(
       private fb: FormBuilder,
       private usuarioService:UsuarioService,
       private empleadoService:EmpleadoService,
       private customerService:CustomerService,
       private cdr: ChangeDetectorRef,
       private router:Router
     ){}
     ngOnInit(): void {
       this.userForm = this.fb.group({
        fullname: ['', [Validators.required, Validators.maxLength(30)]],
        username: ['', [Validators.required, Validators.maxLength(30)]],
        password: ['', [Validators.required, Validators.maxLength(30)]],
        idEmpleado: [null],
        idCliente: [null],
       });

       this.loadRelations();
     }

     loadRelations(): void {
       this.empleadoService.getEmpleados().subscribe(res => {
         this.empleados = res || [];
         this.cdr.markForCheck();
       });
       this.customerService.getCustomerAll().subscribe(res => {
         this.clientes = res || [];
         this.cdr.markForCheck();
       });
     }


     // Método para enviar los datos del formulario
       createUser(): void {
         if (this.userForm.valid) {
           const user = this.userForm.value;
           console.log('data para crear un user:', user);

           this.usuarioService.createUsuario(user).subscribe(
             {
               next: (response) => {
                 Swal.fire({
                   icon: 'success',
                   title: 'Usuario creado',
                   text: 'El usuario se ha creado exitosamente.',
                   confirmButtonText: 'OK'
                 }).then(() => {
                   this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                     this.router.navigate(['/dashboard/user']); // Navega a la lista de productos
                   });
                 });
               },
               error: (err) => {
                 console.error(err);
                 Swal.fire({
                   icon: 'error',
                   title: 'Error',
                   text: 'Hubo un problema al crear el usario. Inténtalo de nuevo.',
                   confirmButtonText: 'OK'
                 });
               }
             }
           );
         } else {
           console.log('Formulario inválido');
         }
       }


       goBack(){
        this.router.navigate(['/dashboard/user']);

       }


 }
