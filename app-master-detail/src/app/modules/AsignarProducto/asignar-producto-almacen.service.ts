import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { catchError, Observable, of, throwError } from 'rxjs';

function httpOptions(token: string | null): { headers: HttpHeaders } {
  return {
    headers: new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json', // Asegurar tipo de contenido
    }),
  };
}
@Injectable({
  providedIn: 'root',
})
export class AsignarProductoAlmacenService {
  private apiUrl = `${environment.URL_SERVICIOS}/productoalmacen`;

  constructor(private http: HttpClient) {}

  createProductoAlamacen(productoAlamacen: any): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (!token) return of({ error: 'No token available' });

    return this.http
      .post<any>(this.apiUrl, productoAlamacen, httpOptions(token))
      .pipe(
        catchError(
          this.handleError<any>('createProductoAlamacen', {
            error: 'Error al crear ProductoAlamacen',
          })
        )
      );
  }
  // Método para agregar un producto al almacén
  addProductoToAlmacen(productoAlmacenDto:any): Observable<any> {
    const token = sessionStorage.getItem('token');
    return this.http.post<any>(`${this.apiUrl}`, productoAlmacenDto, httpOptions(token)).pipe(
      catchError((error) => {
        // Aquí capturas el error y extraes el mensaje
        return throwError(error.error.mensaje || 'Error desconocido');
      })
    );
  }

  // Método para eliminar un producto del almacén
  quitarProducto(productoId: number, almacenId: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    const url = `${this.apiUrl}/${productoId}/${almacenId}`;
    console.log({url})
    return this.http.delete(url,httpOptions(token)).pipe(
      catchError((error) => {
        // Aquí capturas el error y extraes el mensaje
        return throwError(error.error.message || 'Error desconocido');
      })
    );
  }


   /** 🔹 Manejo de errores */
    private handleError<T>(operation = 'operation', result?: T) {
      return (error: any): Observable<T> => {
        console.error(`${operation} failed:`, error); // Loguear el error
        return of(result as T);
      };
    }

}
