import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { catchError, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Permiso } from '../../interfaces/permiso.interface';


const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`, // Asegúrate de enviar el token en el formato correcto
  }),
});

@Injectable({
  providedIn: 'root'
})
export class PermisoService {


     private apiUrl = `${environment.URL_SERVICIOS}/permiso`; // Reemplázalo con tu URL real

      constructor(private http: HttpClient) {}

      getPermisos(): Observable<Permiso[]> {
        const token = sessionStorage.getItem('token'); // Obtener el token del localStorage
        console.log('Token usado:', token); // Verificar el token
        if (token) {
          return this.http
            .get<Permiso[]>(this.apiUrl, httpOptions(token))
            .pipe(catchError(this.handleError('getRoles', [])));
        } else {
          return of([]); // Si no hay token, devuelve un array vacío
        }

      }
      private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
          console.error(error); // Loguea el error para depuración
          return of(result as T); // Retorna el resultado predeterminado
        };
      }

      getPermisoById(id: number): Observable<Permiso> {
        return this.http.get<Permiso>(`${this.apiUrl}/${id}`);
      }

      createPermiso(permiso: Permiso): Observable<Permiso> {

        const token = sessionStorage.getItem('token');
        if (token) {
          // Verificar que todos los campos sean válidos antes de enviar
          if (!permiso.nombre_Permiso ) {
            console.error('Faltan datos necesarios para crear el permiso');
            return of({} as Permiso); // Retorna un objeto vacío si falta algún dato
          }

          return this.http
            .post<Permiso>(this.apiUrl, permiso, httpOptions(token))
            .pipe(catchError(this.handleError('addPermiso', permiso)));
        } else {
          console.error('No hay token disponible');
          return of({} as Permiso); // Retorna un objeto vacío si no hay token
        }
      }



}
