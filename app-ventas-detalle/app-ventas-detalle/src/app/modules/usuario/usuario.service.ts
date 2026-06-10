import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { User } from '../../interfaces/user.interface';
import { environment } from '../../../environments/environment.development';

const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`, // Asegúrate de enviar el token en el formato correcto
  }),
});

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = `${environment.URL_SERVICIOS}/usuario`; // Reemplázalo con tu URL real

  constructor(private http: HttpClient) {}

  // Obtener todos los usuarios
  getUsuarios(): Observable<User[]> {
    const token = sessionStorage.getItem('token'); // Obtener el token del localStorage
    console.log('Token usado:', token); // Verificar el token
    if (token) {
      return this.http
        .get<User[]>(this.apiUrl, httpOptions(token))
        .pipe(catchError(this.handleError('getUsuarios', [])));
    } else {
      return of([]); // Si no hay token, devuelve un array vacío
    }
    return this.http.get<User[]>(this.apiUrl);
  }
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // Loguea el error para depuración
      return of(result as T); // Retorna el resultado predeterminado
    };
  }

  // Obtener un usuario por ID
  getUsuarioById(id: number): Observable<User> {

    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http
        .get<User>(`${this.apiUrl}/${id}`, httpOptions(token))
        .pipe(catchError(this.handleError<User>('getUsuarioById')));
    } else {
      console.error('No hay token disponible');
      return of({} as User); // Retorna un objeto vacío si no hay token
    }
  }

  // Crear un nuevo usuario
  createUsuario(usuario: User): Observable<User> {

    const token = sessionStorage.getItem('token');
    if (token) {
      // Verificar que todos los campos sean válidos antes de enviar
      if (!usuario.username || !usuario.fullname ) {
        console.error('Faltan datos necesarios para crear el usurio');
        return of({} as User); // Retorna un objeto vacío si falta algún dato
      }

      return this.http
        .post<User>(this.apiUrl, usuario, httpOptions(token))
        .pipe(catchError(this.handleError('addProduct', usuario)));
    } else {
      console.error('No hay token disponible');
      return of({} as User); // Retorna un objeto vacío si no hay token
    }
  }

  // Actualizar un usuario
  updateUsuario(id: number, usuario: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, usuario);
  }

  // Eliminar un usuario
  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
