import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';

const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  })
});

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl: string = `${environment.URL_SERVICIOS}/inventario`;

  constructor(private http: HttpClient) { }

  public getLotes(): Observable<any[]> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.get<any[]>(`${this.apiUrl}/lotes`, httpOptions(token)).pipe(
        catchError(this.handleError('getLotes', []))
      );
    }
    return of([]);
  }

  public getMovimientos(): Observable<any[]> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.get<any[]>(`${this.apiUrl}/movimientos`, httpOptions(token)).pipe(
        catchError(this.handleError('getMovimientos', []))
      );
    }
    return of([]);
  }

  public registrarTraspaso(dto: any): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.post<any>(`${this.apiUrl}/traspasos`, dto, httpOptions(token)).pipe(
        catchError(err => throwError(err.error?.mensaje || 'Error al registrar traspaso'))
      );
    }
    return throwError('No token available');
  }

  public getTraspasos(): Observable<any[]> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.get<any[]>(`${this.apiUrl}/traspasos`, httpOptions(token)).pipe(
        catchError(this.handleError('getTraspasos', []))
      );
    }
    return of([]);
  }

  public getConfiguracion(): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.get<any>(`${this.apiUrl}/configuracion`, httpOptions(token)).pipe(
        catchError(this.handleError('getConfiguracion', {}))
      );
    }
    return of({});
  }

  public updateConfiguracion(dto: any): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.post<any>(`${this.apiUrl}/configuracion`, dto, httpOptions(token)).pipe(
        catchError(err => throwError(err.error?.mensaje || 'Error al actualizar configuración'))
      );
    }
    return throwError('No token available');
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}
