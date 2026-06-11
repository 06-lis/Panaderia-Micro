import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { Receta } from '../../../interfaces/recipe.interface';

const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  })
});

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private apiUrl: string = `${environment.URL_SERVICIOS}/receta`;

  constructor(private http: HttpClient) { }

  public getRecipes(): Observable<Receta[]> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.get<Receta[]>(this.apiUrl, httpOptions(token)).pipe(
        catchError(this.handleError('getRecipes', []))
      );
    } else {
      return of([]);
    }
  }

  public getRecipeById(id: number): Observable<Receta> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.get<Receta>(`${this.apiUrl}/${id}`, httpOptions(token)).pipe(
        catchError(this.handleError<Receta>('getRecipeById'))
      );
    } else {
      return throwError('No token available');
    }
  }

  public createRecipe(recipe: any): Observable<Receta> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.post<Receta>(this.apiUrl, recipe, httpOptions(token)).pipe(
        catchError(this.handleError<Receta>('createRecipe'))
      );
    } else {
      return throwError('No token available');
    }
  }

  public updateRecipe(id: number, recipe: Receta): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.put(`${this.apiUrl}/${id}`, recipe, httpOptions(token)).pipe(
        catchError(this.handleError<any>('updateRecipe'))
      );
    } else {
      return throwError('No token available');
    }
  }

  public deleteRecipe(id: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.delete(`${this.apiUrl}/${id}`, httpOptions(token)).pipe(
        catchError((error) => {
          return throwError(error.error?.message || 'Error al eliminar la receta');
        })
      );
    } else {
      return throwError('No token available');
    }
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}
