import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SaleDetail } from '../../../interfaces/sale-detail.inteface';
import { catchError, Observable, of } from 'rxjs';


function httpOptions(token: string): { headers: HttpHeaders } {
  return {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${token}`
    })
  };
}

@Injectable({
  providedIn: 'root'
})
export class SaleDetailService {

  private apiUrl = `${environment.URL_SERVICIOS}/detalleventa`;
    constructor(private http: HttpClient) { }


    getDetallesAll(): Observable<SaleDetail[]> {
      const token = sessionStorage.getItem('token');  // Obtener el token del localStorage
          console.log('Token usado:', token); // Verificar el token
          if (token) {
            return this.http.get<SaleDetail[]>(this.apiUrl, httpOptions(token)).pipe(
              catchError(this.handleError('getDetallesAll', []))
            );
          } else {
            return of([]);  // Si no hay token, devuelve un array vacío
          }
    }

    createDetalle(sale: SaleDetail): Observable<SaleDetail> {
      const token = sessionStorage.getItem('token');  // Obtener el token del localStorage
      // return this.http.post<Sale>(this.apiUrl, sale);
      console.log({sale}); // Verificar el token
      if (token) {
        return this.http.post<SaleDetail>(this.apiUrl, sale, httpOptions(token));
      } else {
        return of();  // Si no hay token, devuelve un array vacío
      }
    }

    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
          console.error(error); // Loguea el error para depuración
          return of(result as T); // Retorna el resultado predeterminado
        };
    }

    deleteDetalle(saleId:number): Observable<any> {
      const token = sessionStorage.getItem('token');  // Obtener el token del localStorage
      if (token) {
        return this.http.delete(`${this.apiUrl}/${saleId}`, httpOptions(token)).pipe(
          catchError(this.handleError('deleteDetalle', []))
        );
      } else {
        return of();  // Si no hay token, devuelve un array vacío
      }
    }

    getDetallesPorVenta(ventaId: number): Observable<SaleDetail[]> {
      // return this.http.get<SaleDetail[]>(`${this.apiUrl}/${ventaId}`);

      const token = sessionStorage.getItem('token');  // Obtener el token del localStorage
      if (token) {
        return this.http.get<SaleDetail[]>(`${this.apiUrl}/${ventaId}`, httpOptions(token)).pipe(
          catchError(this.handleError('getDetallesPorVenta', []))
        );
      } else {
        return of();  // Si no hay token, devuelve un array vacío
      }
    }

}
