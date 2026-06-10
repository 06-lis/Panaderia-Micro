import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Rol } from '../../interfaces/rol.interface';
import { catchError, Observable, of } from 'rxjs';
import { RolPermiso } from '../../interfaces/rol-permiso.interface';
import { RolPermisoUsuario } from '../../interfaces/rol-permiso-usuario.interface';

const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`, // Asegúrate de enviar el token en el formato correcto
  }),
});


@Injectable({
  providedIn: 'root'
})
export class RolService {

   private apiUrl = `${environment.URL_SERVICIOS}/roles`; // Reemplázalo con tu URL real

    constructor(private http: HttpClient) {}

    getRoles(): Observable<Rol[]> {
      const token = sessionStorage.getItem('token'); // Obtener el token del localStorage
      console.log('Token usado:', token); // Verificar el token
      if (token) {
        return this.http
          .get<Rol[]>(this.apiUrl, httpOptions(token))
          .pipe(catchError(this.handleError('getRoles', [])));
      } else {
        return of([]); // Si no hay token, devuelve un array vacío
      }

    }


    getRolById(id: number): Observable<Rol> {
      const token = sessionStorage.getItem('token'); // Obtener el token del localStorage
      console.log('Token usado:', token); // Verificar el token
      if (token) {
        return this.http.get<Rol>(`${this.apiUrl}/${id}`,httpOptions(token))
          .pipe(catchError(this.handleError('getRoleByid', {} as Rol)));
      } else {
        return of(); // Si no hay token, devuelve un array vacío
      }
    }

    createRol(rol: Rol): Observable<Rol> {

      const token = sessionStorage.getItem('token');
      if (token) {
        // Verificar que todos los campos sean válidos antes de enviar
        if (!rol.nombre_Rol  ) {
          console.error('Faltan datos necesarios para crear el rol');
          return of({} as Rol); // Retorna un objeto vacío si falta algún dato
        }

        return this.http
          .post<Rol>(this.apiUrl, rol, httpOptions(token))
          .pipe(catchError(this.handleError('addRol', rol)));
      } else {
        console.error('No hay token disponible');
        return of({} as Rol); // Retorna un objeto vacío si no hay token
      }
    }



    updateRol(id: number, rol: Rol): Observable<Rol> {
      return this.http.put<Rol>(`${this.apiUrl}/${id}`,rol);
    }


    deleteRol(id: number): Observable<void> {
      const token = sessionStorage.getItem('token');
      if (token) {
        return this.http
          .delete<void>(`${this.apiUrl}/${id}`, httpOptions(token))
          .pipe(catchError(this.handleError<void>('deleteRol')));
      } else {
        console.error('No hay token disponible');
        return of(undefined);
      }
    }

    private handleError<T>(operation = 'operation', result?: T) {
      return (error: any): Observable<T> => {
        console.error(error); // Loguea el error para depuración
        return of(result as T); // Retorna el resultado predeterminado
      };
    }



    // Métodos para asignar permisos a un rol /////////////
    createRolPerimo(rolpermiso: RolPermiso): Observable<RolPermiso> {

      const urlRolPermiso:string =`${environment.URL_SERVICIOS}/rolpermisos`;
      const token = sessionStorage.getItem('token');
      if (token) {
        // Verificar que todos los campos sean válidos antes de enviar

        return this.http
          .post<RolPermiso>(urlRolPermiso, rolpermiso, httpOptions(token))
          .pipe(catchError(this.handleError('addRolPermisos', rolpermiso)));
      } else {
        console.error('No hay token disponible');
        return of({} as RolPermiso); // Retorna un objeto vacío si no hay token
      }
    }
    deleteRolPermisos(id_rolpermiso?: number): Observable<any> {

      const urlRolPermiso:string =`${environment.URL_SERVICIOS}/rolpermisos/${id_rolpermiso}`;
      const token = sessionStorage.getItem('token');
      if (token) {
        // Verificar que todos los campos sean válidos antes de enviar
        return this.http
          .delete<any>(urlRolPermiso, httpOptions(token))
          .pipe(catchError(this.handleError('addRolPermisos', id_rolpermiso)));
      } else {
        console.error('No hay token disponible');
        return of({} as RolPermiso); // Retorna un objeto vacío si no hay token
      }
    }
    // Fin de métodos para asignar permisos a un rol /////////////

    // Métodos para asignar rol permisos a un Usuario /////////////
    getRolPermisoUsuario(): Observable<RolPermisoUsuario[]> {
      const urlRolUsuario:string =`${environment.URL_SERVICIOS}/rolpermisousuario`;
      const token = sessionStorage.getItem('token'); // Obtener el token del localStorage
      console.log('Token usado:', token); // Verificar el token
      if (token) {
        return this.http
          .get<RolPermisoUsuario[]>(urlRolUsuario, httpOptions(token))
          .pipe(catchError(this.handleError('getRolUsuario', [])));
      } else {
        return of([]); // Si no hay token, devuelve un array vacío
      }

    }


    createRolUsuario(rolusuario: RolPermisoUsuario): Observable<RolPermisoUsuario> {

      const urlRolUsuario:string =`${environment.URL_SERVICIOS}/rolpermisousuarios`;
      const token = sessionStorage.getItem('token');
      if (token) {
        // Verificar que todos los campos sean válidos antes de enviar
        console.log('Datos a enviar:', rolusuario);
        return this.http
          .post<RolPermisoUsuario>(urlRolUsuario, rolusuario, httpOptions(token))
          .pipe(catchError(this.handleError('addRolPermisoUsuarios',rolusuario)));
      } else {
        console.error('No hay token disponible');
        return of({} as RolPermisoUsuario); // Retorna un objeto vacío si no hay token
      }
    }

    getRolUsuarioById(id: number): Observable<RolPermisoUsuario> {
      const urlRolUsuario:string =`${environment.URL_SERVICIOS}/rolpermisousuario/${id}`;
      const token = sessionStorage.getItem('token'); // Obtener el token del localStorage
      console.log('Token usado:', token); // Verificar el token
      if (token) {
        return this.http
          .get<RolPermisoUsuario>(urlRolUsuario, httpOptions(token))
          .pipe(catchError(this.handleError('getRolUsuarioById', {} as RolPermisoUsuario)));
      } else {
        return of({} as RolPermisoUsuario); // Si no hay token, devuelve un array vacío
      }
    }

    deleteRolUsuario(id_rolusuario?: number): Observable<any> {

      const urlRolUsuario:string =`${environment.URL_SERVICIOS}/rolpermisousuario/${id_rolusuario}`;
      const token = sessionStorage.getItem('token');
      if (token) {
        // Verificar que todos los campos sean válidos antes de enviar
        return this.http
          .delete<any>(urlRolUsuario, httpOptions(token))
          .pipe(catchError(this.handleError('addRolPermisoUsuarios', id_rolusuario)));
      } else {
        console.error('No hay token disponible');
        return of({} as RolPermisoUsuario); // Retorna un objeto vacío si no hay token
      }
    }
    // Fin de métodos para asignar rol permisos a un Usuario /////////////


}
