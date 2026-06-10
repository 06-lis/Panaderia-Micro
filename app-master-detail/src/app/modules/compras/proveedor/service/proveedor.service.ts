import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment.development';
import { Proveedor, CreateProveedorDto } from '../../../../interfaces/proveedor.interface';

const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }),
});

@Injectable({ providedIn: 'root' })
export class ProveedorService {
  // Gateway expone /api/proveedor → MSVenta.Compras en :5003
  private apiUrl = `${environment.URL_SERVICIOS}/proveedor`;

  constructor(private http: HttpClient) {}

  getProveedores(): Observable<Proveedor[]> {
    const token = sessionStorage.getItem('token');
    if (!token) return of([]);
    return this.http
      .get<Proveedor[]>(this.apiUrl, httpOptions(token))
      .pipe(catchError((err) => {
        console.error('Error al obtener proveedores:', err);
        return of([]);
      }));
  }

  getProveedorById(id: number): Observable<Proveedor | null> {
    const token = sessionStorage.getItem('token') || '';
    return this.http
      .get<Proveedor>(`${this.apiUrl}/${id}`, httpOptions(token))
      .pipe(catchError(() => of(null)));
  }

  createProveedor(dto: CreateProveedorDto): Observable<Proveedor | null> {
    const token = sessionStorage.getItem('token') || '';
    return this.http
      .post<Proveedor>(this.apiUrl, dto, httpOptions(token))
      .pipe(catchError((err) => {
        console.error('Error al crear proveedor:', err);
        return of(null);
      }));
  }

  updateProveedor(id: number, dto: Partial<CreateProveedorDto>): Observable<any> {
    const token = sessionStorage.getItem('token') || '';
    return this.http
      .put(`${this.apiUrl}/${id}`, dto, httpOptions(token))
      .pipe(catchError((err) => {
        console.error('Error al actualizar proveedor:', err);
        return of(null);
      }));
  }

  deleteProveedor(id: number): Observable<any> {
    const token = sessionStorage.getItem('token') || '';
    return this.http
      .delete(`${this.apiUrl}/${id}`, httpOptions(token))
      .pipe(catchError((err) => {
        console.error('Error al eliminar proveedor:', err);
        return of(null);
      }));
  }
}
