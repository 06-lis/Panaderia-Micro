import { ChangeDetectionStrategy, Component, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../interfaces/user.interface';
import { UsuarioService } from '../usuario.service';
import { EmpleadoService } from '../empleado.service';
import { CustomerService } from '../../customer/service/customer.service';
import { Empleado } from '../../../interfaces/empleado.interface';
import { Customer } from '../../../interfaces/customer.interface';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuario-edit',
  imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule
  ],
  templateUrl: './usuario-edit.component.html',
  styleUrl: './usuario-edit.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuarioEditComponent implements OnInit {
   @Input() user:User[]=[];
   userForm!: FormGroup ;
   empleados: Empleado[] = [];
   clientes: Customer[] = [];
   
   // Modals state
   showEmpleadoModal = false;
   showClienteModal = false;
   
   // Forms for modals
   empleadoForm!: FormGroup;
   clienteForm!: FormGroup;

   userId!: number;

   constructor(
       private fb: FormBuilder,
       private usuarioService:UsuarioService,
       private empleadoService:EmpleadoService,
       private customerService:CustomerService,
       private cdr: ChangeDetectorRef,
       private router:Router,
       private route: ActivatedRoute
     ){}

     ngOnInit(): void {
       this.userForm = this.fb.group({
        fullname: ['', [Validators.required, Validators.maxLength(30)]],
        username: ['', [Validators.required, Validators.maxLength(30)]],
        password: ['', [Validators.required, Validators.maxLength(30)]],
        tipoRelacion: ['Ninguno'], // 'Ninguno', 'Empleado', 'Cliente'
        idEmpleado: [null],
        idCliente: [null],
       });

       this.empleadoForm = this.fb.group({
         nombre: ['', Validators.required],
         apellido: ['', Validators.required],
         telefono: [''],
         sueldo: [0]
       });

       this.clienteForm = this.fb.group({
         nombre: ['', Validators.required],
         apellidos: ['', Validators.required],
         celular: [0]
       });

       // Reset select values when relation type changes
       this.userForm.get('tipoRelacion')?.valueChanges.subscribe(val => {
         if (val !== 'Empleado') this.userForm.get('idEmpleado')?.setValue(null);
         if (val !== 'Cliente') this.userForm.get('idCliente')?.setValue(null);
       });

       this.loadRelations();

       this.route.paramMap.subscribe(params => {
         const idParam = params.get('id');
         if (idParam) {
           this.userId = +idParam;
           this.loadUser();
         }
       });
     }

     loadUser(): void {
       this.usuarioService.getUsuarioById(this.userId).subscribe({
         next: (user) => {
           if (user) {
             let tipoRelacion = 'Ninguno';
             if (user.idEmpleado) tipoRelacion = 'Empleado';
             else if (user.idCliente) tipoRelacion = 'Cliente';

             this.userForm.patchValue({
               fullname: user.fullname,
               username: user.username,
               password: user.password,
               tipoRelacion: tipoRelacion,
               idEmpleado: user.idEmpleado,
               idCliente: user.idCliente
             });
             this.cdr.markForCheck();
           }
         },
         error: (err) => console.error('Error cargando usuario', err)
       });
     }

     loadRelations(): void {
       this.usuarioService.getUsuarios().subscribe(users => {
         const assignedEmpleados = (users || []).filter(u => u.idEmpleado).map(u => u.idEmpleado);
         const assignedClientes = (users || []).filter(u => u.idCliente).map(u => u.idCliente);

         this.empleadoService.getEmpleados().subscribe(res => {
           console.log('Empleados from backend:', res);
           this.empleados = (res || []).filter(e => !assignedEmpleados.includes(e.idEmpleado));
           this.cdr.markForCheck();
         });

         this.customerService.getCustomerAll().subscribe(res => {
           console.log('Clientes from backend:', res);
           this.clientes = (res || []).filter(c => !assignedClientes.includes(c.id) && !assignedClientes.includes(c.customerId));
           this.cdr.markForCheck();
         });
       });
     }

     // Empleado Modal logic
     openEmpleadoModal(): void {
       this.empleadoForm.reset({ sueldo: 0 });
       this.showEmpleadoModal = true;
     }

     closeEmpleadoModal(): void {
       this.showEmpleadoModal = false;
     }

     createEmpleado(): void {
       if (this.empleadoForm.valid) {
         this.empleadoService.createEmpleado(this.empleadoForm.value).subscribe({
           next: (res: any) => {
             console.log('Created Empleado:', res);
             Swal.fire('Éxito', 'Empleado creado correctamente', 'success');
             this.showEmpleadoModal = false;
             
             // Optimistic update
             const newId = res.idEmpleado || res.id; 
             const newEmp = { ...this.empleadoForm.value, idEmpleado: newId };
             this.empleados = [...this.empleados, newEmp];
             this.cdr.markForCheck();

             if (newId) {
               this.userForm.patchValue({ tipoRelacion: 'Empleado' });
               setTimeout(() => this.userForm.patchValue({ idEmpleado: newId }), 0);
             }
             this.loadRelations();
           },
           error: (err) => Swal.fire('Error', 'No se pudo crear el empleado', 'error')
         });
       }
     }

     // Cliente Modal logic
     openClienteModal(): void {
       this.clienteForm.reset({ celular: 0 });
       this.showClienteModal = true;
     }

     closeClienteModal(): void {
       this.showClienteModal = false;
     }

     createCliente(): void {
       if (this.clienteForm.valid) {
         this.customerService.createCustomer(this.clienteForm.value).subscribe({
           next: (res: any) => {
             console.log('Created Cliente:', res);
             Swal.fire('Éxito', 'Cliente creado correctamente', 'success');
             this.showClienteModal = false;
             
             // Optimistic update
             const newId = res.id || res.customerId;
             const newCli = { ...this.clienteForm.value, id: newId, customerId: newId };
             this.clientes = [...this.clientes, newCli];
             this.cdr.markForCheck();

             if (newId) {
               this.userForm.patchValue({ tipoRelacion: 'Cliente' });
               setTimeout(() => this.userForm.patchValue({ idCliente: newId }), 0);
             }
             this.loadRelations();
           },
           error: (err) => Swal.fire('Error', 'No se pudo crear el cliente', 'error')
         });
       }
     }

     // Método para enviar los datos del formulario
     updateUser(): void {
       if (this.userForm.valid) {
         const user = this.userForm.value;
         user.userId = this.userId;
         console.log('data para actualizar un user:', user);

         this.usuarioService.updateUsuario(this.userId, user).subscribe(
           {
             next: (response) => {
               Swal.fire({
                 icon: 'success',
                 title: 'Usuario actualizado',
                 text: 'El usuario se ha actualizado exitosamente.',
                 confirmButtonText: 'OK'
               }).then(() => {
                 this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                   this.router.navigate(['/dashboard/user']);
                 });
               });
             },
             error: (err) => {
               console.error(err);
               Swal.fire({
                 icon: 'error',
                 title: 'Error',
                 text: 'Hubo un problema al actualizar el usuario. Inténtalo de nuevo.',
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
