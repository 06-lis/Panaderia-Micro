import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment.development';
import { NotaCompra, CreateNotaCompraDto } from '../../../../interfaces/nota-compra.interface';

const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }),
});

@Injectable({ providedIn: 'root' })
export class NotaCompraService {
  // Gateway expone /api/compra → MSVenta.Compras en :5003 (CompraController)
  private apiUrl = `${environment.URL_SERVICIOS}/compra`;

  constructor(private http: HttpClient) {}

  getNotasCompra(): Observable<NotaCompra[]> {
    const token = sessionStorage.getItem('token');
    if (!token) return of([]);
    return this.http
      .get<NotaCompra[]>(this.apiUrl, httpOptions(token))
      .pipe(catchError((err) => {
        console.error('Error al obtener notas de compra:', err);
        return of([]);
      }));
  }

  getNotaCompraById(id: number): Observable<NotaCompra | null> {
    const token = sessionStorage.getItem('token') || '';
    return this.http
      .get<NotaCompra>(`${this.apiUrl}/${id}`, httpOptions(token))
      .pipe(catchError(() => of(null)));
  }

  createNotaCompra(dto: CreateNotaCompraDto): Observable<NotaCompra | null> {
    const token = sessionStorage.getItem('token') || '';
    return this.http
      .post<NotaCompra>(this.apiUrl, dto, httpOptions(token))
      .pipe(catchError((err) => {
        console.error('Error al crear nota de compra:', err);
        return of(null);
      }));
  }
}
