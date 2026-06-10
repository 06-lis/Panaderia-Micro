import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';

const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  })
});

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl: string = `${environment.URL_SERVICIOS}/item`;

  constructor(private http: HttpClient) { }

  public createItem(item: any): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.post<any>(this.apiUrl, item, httpOptions(token)).pipe(
        catchError((err) => {
          console.error('Error al crear el item:', err);
          throw err;
        })
      );
    } else {
      console.error('No hay token disponible');
      return of(null);
    }
  }

  public getItems(): Observable<any[]> {
    const token = sessionStorage.getItem('token');
    if (token) {
      return this.http.get<any[]>(this.apiUrl, httpOptions(token)).pipe(
        catchError((err) => {
          console.error('Error al obtener los items:', err);
          throw err;
        })
      );
    } else {
      console.error('No hay token disponible');
      return of([]);
    }
  }
}
