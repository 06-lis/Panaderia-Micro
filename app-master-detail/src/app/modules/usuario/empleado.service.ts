import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { Empleado } from '../../interfaces/empleado.interface';
import { environment } from '../../../environments/environment.development';

const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }),
});

@Injectable({
  providedIn: 'root',
})
export class EmpleadoService {
  private apiUrl = `${environment.URL_SERVICIOS}/empleado`;

  constructor(private http: HttpClient) {}

  getEmpleados(): Observable<Empleado[]> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http
        .get<Empleado[]>(this.apiUrl, httpOptions(token))
        .pipe(catchError(this.handleError('getEmpleados', [])));
    } else {
      return of([]);
    }
  }

  getEmpleadoById(id: number): Observable<Empleado> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http
        .get<Empleado>(`${this.apiUrl}/${id}`, httpOptions(token))
        .pipe(catchError(this.handleError<Empleado>('getEmpleadoById')));
    } else {
      return of({} as Empleado);
    }
  }

  createEmpleado(empleado: Empleado): Observable<Empleado> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http
        .post<Empleado>(this.apiUrl, empleado, httpOptions(token))
        .pipe(catchError(this.handleError('createEmpleado', empleado)));
    } else {
      return of({} as Empleado);
    }
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }
}
