import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../service/category.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-add',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './category-add.component.html',
  styleUrl: './category-add.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryAddComponent {

  categoryForm: FormGroup;

  constructor(
      private fb: FormBuilder,
      private categoryService: CategoryService,
      private router:Router
    ) {
    this.categoryForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(40)]]
    });
  }


  createCategory() {
    if (this.categoryForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, completa todos los campos obligatorios.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const categoryData = this.categoryForm.value;
    this.categoryService.createCategory(categoryData).subscribe(
      (category) => {
        Swal.fire({
          icon: 'success',
          title: '¡Categoría creada!',
          text: `La categoría "${category.nombre}" se creó con éxito.`,
          confirmButtonText: 'Aceptar'
        }).then(()=>{
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/dashboard/category/list']); // Navega a la lista de productos
          });
        });

        this.categoryForm.reset(); // Resetea el formulario
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al crear la categoría',
          text: 'Ocurrió un problema al intentar crear la categoría. Por favor, inténtalo nuevamente.',
          confirmButtonText: 'Entendido'
        });
        console.error('Error:', error);
      }
    );
  }

  goBack():void{
    this.router.navigate(['/dashboard/category/list']);
  }
 }
