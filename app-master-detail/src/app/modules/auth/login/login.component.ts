import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { User } from '../../../interfaces/user.interface';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent implements OnInit {
  user!: User;
  errorMessage: string | null = null;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    if (sessionStorage.getItem('token')) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.user = {
      username: '',
      password: '',
    };
  }

  public login(): void {
    this.authService.getToken(this.user).subscribe(
      (response: User) => {
        console.log('response:', response);
        sessionStorage.setItem("token", response.token || '');
        sessionStorage.setItem('user', JSON.stringify(response)); // Guardar los datos del usuario en sessionStorage
        sessionStorage.setItem('roles', JSON.stringify(response.roles)); // Guardar roles
        
        // Si es cliente (no tiene idEmpleado pero sí idCliente), redirigir a principal
        if (response.idCliente && !response.idEmpleado) {
          this.router.navigate(['/principal']);
        } else {
          this.redirectToDashboard();
        }
      },
      (error) => {
        this.errorMessage = error.message;
        console.error("Error en login", this.errorMessage);
        this.router.navigate(['/auth/login']);
      }
    );
  }

  private redirectToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

}
