import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string | null = null;
  loading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8), 
        Validators.maxLength(50),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=(?:.*\\d){2,})(?=.*[^a-zA-Z\\d\\s]).{8,}$')
      ]],
      confirmPassword: ['', [Validators.required]],
      celular: ['', [Validators.required, Validators.pattern('^[0-9]{7,10}$')]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    const payload = { ...this.registerForm.value };
    delete payload.confirmPassword;

    this.http.post<any>(`${environment.URL_SERVICIOS}/landing/register`, payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.cdr.markForCheck();
        Swal.fire({
          icon: 'success',
          title: '¡Registro Exitoso!',
          text: 'Tu cuenta de cliente ha sido creada. Ahora puedes iniciar sesión.',
          confirmButtonColor: '#8E4E2A'
        }).then(() => {
          this.router.navigate(['/auth/login']);
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Ocurrió un error al registrar la cuenta. Inténtalo de nuevo.';
        this.cdr.markForCheck();
        Swal.fire({
          icon: 'error',
          title: 'Error de registro',
          text: this.errorMessage || 'No se pudo crear la cuenta.',
          confirmButtonColor: '#3E261A'
        });
      }
    });
  }
}
