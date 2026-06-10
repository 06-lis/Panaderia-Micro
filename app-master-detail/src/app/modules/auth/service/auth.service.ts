import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { User } from '../../../interfaces/user.interface';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private urlAuth = `${environment.URL_SERVICIOS}/token`;

  constructor(private http: HttpClient) {}

  public getToken(user: User): Observable<User> {
    return this.http.post<any>(this.urlAuth, user, httpOptions).pipe(
      map((res: HttpResponse<any>) => {
        if (res.headers.has("Authorization")) {
          const token = res.headers.get("Authorization"); // Obtener el token desde los headers
          /* user.token = res.headers.get("Authorization");
          localStorage.setItem('token', 'Bearer ' + res.headers.get("Authorization")); */
          if (token) { // Solo asigna si no es null
            user.token = token;
            //localStorage.setItem('token', 'Bearer ' + token);
            sessionStorage.setItem('token', 'Bearer ' + token);

          }
        }
        //return user;
        // Retornar la data del usuario correctamente
      return { ...user, ...res.body.user };
      }),
      catchError(this.handleError)
    );
  }



  private handleError(error: any) {
    console.error("AuthService error", error);
    return throwError(() => new Error("Error de autenticación: " + error.message));
  }
}
