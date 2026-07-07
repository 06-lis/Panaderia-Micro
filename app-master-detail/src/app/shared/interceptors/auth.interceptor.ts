import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // La sesión expiró o no está autenticado
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('usuario');
        
        Swal.fire({
          icon: 'warning',
          title: 'Sesión expirada',
          text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          confirmButtonText: 'Ir al Login',
          confirmButtonColor: '#8E4E2A',
          allowOutsideClick: false
        }).then(() => {
          router.navigate(['/auth/login']);
        });
      }
      return throwError(() => error);
    })
  );
};
