import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Sale } from '../../../interfaces/sale.interface';
import { catchError, Observable, of } from 'rxjs';
import { Venta } from '../../../interfaces/venta.interface';

function httpOptions(token: string | null): { headers: HttpHeaders } {
  return {
    headers: new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'  // Asegurar tipo de contenido
    })
  };
}

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private apiUrl = `${environment.URL_SERVICIOS}/venta`;

  constructor(private http: HttpClient) { }

  /** 🔹 Obtener ventas por rango de fechas */
  getSalesByDateRange(startDate: string, endDate: string): Observable<Sale[]> {
    const token = sessionStorage.getItem('token');
    if (!token) return of([]);  // Si no hay token, retornar array vacío
    return this.http.get<Sale[]>(`${this.apiUrl}/report?startDate=${startDate}&endDate=${endDate}`, httpOptions(token))
      .pipe(catchError(this.handleError<Sale[]>('getSalesByDateRange', [])));
  }

  /** 🔹 Obtener todas las ventas */
  getSalesAll(): Observable<Sale[]> {
    const token = sessionStorage.getItem('token');
    if (!token) return of([]);
    return this.http.get<Sale[]>(this.apiUrl, httpOptions(token))
      .pipe(catchError(this.handleError<Sale[]>('getSalesAll', [])));
  }

  /** 🔹 Crear una venta */
  createSale(sale: Venta): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (!token) return of({ error: 'No token available' });

    console.log('Enviando venta:', sale); // Verificar la data enviada
    // const dataventa={
    //     "fecha": "2024-01-31T00:00:00",
    //     "clienteId": sale.clienteId,
    //     "usuarioId": sale.usuarioId
    // };
    // console.log('Enviando venta:', dataventa); // Verificar la data enviada
    return this.http.post<any>(this.apiUrl,sale, httpOptions(token))
      .pipe(catchError(this.handleError<any>('createSale', { error: 'Error al crear la venta' })));
  }

  /** 🔹 Eliminar una venta */
  deleteSale(saleId: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (!token) return of({ error: 'No token available' });

    return this.http.delete(`${this.apiUrl}/${saleId}`, httpOptions(token))
      .pipe(catchError(this.handleError<any>('deleteSale', { error: 'Error al eliminar' })));
  }

  /** 🔹 Manejo de errores */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error); // Loguear el error
      return of(result as T);
    };
  }

  // Función para crear un detalle de venta
  createDetalleVenta(detalle: any): Observable<any> {

    const apiUrlDetalle = `${environment.URL_SERVICIOS}/detalleventa`;
    const token = sessionStorage.getItem('token'); // Obtener el token

    // Verificar si el token existe antes de enviar la solicitud
    if (token) {
      return this.http.post<any>(apiUrlDetalle, detalle,httpOptions(token)).pipe(
        catchError(this.handleError('createDetalleVenta', {}))
      );
    } else {
      return of({});  // Si no hay token, se devuelve un objeto vacío
    }
  }
}
