import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { Produccion } from '../../../interfaces/production.interface';

const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  })
});

@Injectable({
  providedIn: 'root'
})
export class ProductionService {
  private apiUrl: string = `${environment.URL_SERVICIOS}/produccion`;

  constructor(private http: HttpClient) { }

  public getProductions(): Observable<Produccion[]> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.get<Produccion[]>(this.apiUrl, httpOptions(token)).pipe(
        catchError(this.handleError('getProductions', []))
      );
    } else {
      return of([]);
    }
  }

  public getProductionById(id: number): Observable<Produccion> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.get<Produccion>(`${this.apiUrl}/${id}`, httpOptions(token)).pipe(
        catchError(this.handleError<Produccion>('getProductionById'))
      );
    } else {
      return throwError('No token available');
    }
  }

  public solicitarProduccion(dto: { recetaId: number; almacenId: number; lote: number; empleadoSolicitaId: number; observaciones: string }): Observable<Produccion> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.post<Produccion>(`${this.apiUrl}/solicitar`, dto, httpOptions(token)).pipe(
        catchError((error) => {
          return throwError(error.error?.mensaje || 'Error al solicitar la producción');
        })
      );
    } else {
      return throwError('No token available');
    }
  }

  public aprobarProduccion(id: number, empleadoAutorizaId: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (token) {
      const dto = { empleadoAutorizaId };
      return this.http.post(`${this.apiUrl}/aprobar/${id}`, dto, httpOptions(token)).pipe(
        catchError((error) => {
          return throwError(error.error?.mensaje || 'Error al aprobar la producción');
        })
      );
    } else {
      return throwError('No token available');
    }
  }

  public rechazarProduccion(id: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.post(`${this.apiUrl}/rechazar/${id}`, {}, httpOptions(token)).pipe(
        catchError((error) => {
          return throwError(error.error?.mensaje || 'Error al rechazar la producción');
        })
      );
    } else {
      return throwError('No token available');
    }
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}
