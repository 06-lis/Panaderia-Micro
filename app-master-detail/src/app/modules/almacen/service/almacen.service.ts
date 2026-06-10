import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Almacen } from '../../../interfaces/almacen.interface';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';

const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`, // Asegúrate de enviar el token en el formato correcto
  }),
});

@Injectable({
  providedIn: 'root',
})
export class AlmacenService {
  // private apiUrl = 'http://localhost:5002/api/almacen'; // Cambia según la URL de tu API
  private apiUrl = `${environment.URL_SERVICIOS}/almacen`;
  constructor(private http: HttpClient) {}

  // Obtener todas las categorías
  getAlmacenes(): Observable<Almacen[]> {
    const token = sessionStorage.getItem('token'); // Obtener el token del localStorage
    console.log('Token usado:', token); // Verificar el token
    if (token) {
      return this.http
        .get<Almacen[]>(this.apiUrl, httpOptions(token))
        .pipe(catchError(this.handleError('getAlmacen', [])));
    } else {
      return of([]); // Si no hay token, devuelve un array vacío
    }
  }

  // Obtener una categoría por ID
  getAlmacenById(id: number): Observable<Almacen> {
    return this.http.get<Almacen>(`${this.apiUrl}/${id}`);
  }

  // Crear una nueva categoría
  addAlmacen(almacen: Almacen): Observable<Almacen> {
    const token = sessionStorage.getItem('token');
    if (token) {
      // Verificar que todos los campos sean válidos antes de enviar
      if (!almacen.nombre || !almacen.locacion) {
        console.error('Faltan datos necesarios para crear el almacen');
        return of({} as Almacen); // Retorna un objeto vacío si falta algún dato
      }

      return this.http
        .post<Almacen>(this.apiUrl, almacen, httpOptions(token))
        .pipe(catchError(this.handleError('addAlmacen', almacen)));
    } else {
      console.error('No hay token disponible');
      return of({} as Almacen); // Retorna un objeto vacío si no hay token
    }
  }

  // Actualizar una categoría
  updateAlmacen(id: number, Almacen: Almacen): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, Almacen);
  }

  // Eliminar una categoría
  deleteAlmacen(id: number): Observable<any> {
    // return this.http.delete<void>(`${this.apiUrl}/${id}`);
    const token = sessionStorage.getItem('token'); // Obtener el token del localStorage
    if (token) {
      return this.http
        .delete(`${this.apiUrl}/${id}`, httpOptions(token))
        .pipe(catchError(this.handleError('deleteAlmacen')));
    } else {
      return of(null); // Si no hay token, no hace nada
    }
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // Loguea el error para depuración
      return of(result as T); // Retorna el resultado predeterminado
    };
  }
}
