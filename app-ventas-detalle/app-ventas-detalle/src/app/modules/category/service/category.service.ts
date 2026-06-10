import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { Category } from '../../../interfaces/category.interface';


const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // Asegúrate de enviar el token en el formato correcto
  })
});

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private url:string = `${environment.URL_SERVICIOS}/categoria`;
  constructor(private http: HttpClient) { }


  public getCategoryAll(): Observable<Category[]> {
      const token = sessionStorage.getItem('token');  // Obtener el token del localStorage
      console.log('Token usado:', token); // Verificar el token
      if (token) {
        return this.http.get<Category[]>(this.url, httpOptions(token)).pipe(
          catchError(this.handleError('getCategoryAll', []))
        );
      } else {
        return of([]);  // Si no hay token, devuelve un array vacío
      }
  }


  public createCategory(category: Category): Observable<Category> {
    const token = sessionStorage.getItem('token'); // Obtén el token desde sessionStorage
    if (token) {
      return this.http.post<Category>(this.url, category, httpOptions(token)).pipe(
        catchError(this.handleError<Category>('createCategory'))
      );
    } else {
      console.error('No token found');
      return of(); // Si no hay token, retorna un observable vacío
    }
  }


  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // Loguea el error para depuración
      return of(result as T); // Retorna el resultado predeterminado
    };
  }

}
