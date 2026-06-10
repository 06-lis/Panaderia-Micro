import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { Product } from '../../../interfaces/poduct.interface';

const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // Asegúrate de enviar el token en el formato correcto
  })
});

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  apiUrl:string = `${environment.URL_SERVICIOS}/producto`

  constructor(private http: HttpClient) { }

   // Obtener todos los clientes
    public getProductAll(): Observable<Product[]> {
      const token = sessionStorage.getItem('token');  // Obtener el token del localStorage
      console.log('Token usado:', token); // Verificar el token
      if (token) {
        return this.http.get<Product[]>(this.apiUrl, httpOptions(token)).pipe(
          catchError(this.handleError('getProductAll', []))
        );
      } else {
        return of([]);  // Si no hay token, devuelve un array vacío
      }
    }

    private handleError<T>(operation = 'operation', result?: T) {
      return (error: any): Observable<T> => {
        console.error(error); // Loguea el error para depuración
        return of(result as T); // Retorna el resultado predeterminado
      };
    }

    // public createProduct(product:Product)
    public createProduct(product: Product): Observable<Product> {
      const token = sessionStorage.getItem('token');
      if (token) {
        // Verificar que todos los campos sean válidos antes de enviar
        if (!product.nombre || !product.precio || !product.id_categoria) {
          console.error('Faltan datos necesarios para crear el producto');
          return of({} as Product); // Retorna un objeto vacío si falta algún dato
        }

        return this.http.post<Product>(this.apiUrl, product, httpOptions(token)).pipe(
          catchError(this.handleError('addProduct', product))
        );
      } else {
        console.error('No hay token disponible');
        return of({} as Product);  // Retorna un objeto vacío si no hay token
      }
    }

    public deleteProduct(product_id: number):Observable<any> {
        const token = sessionStorage.getItem('token');  // Obtener el token del localStorage
        // console.erro
          return this.http.delete(`${this.apiUrl}/${product_id}`, httpOptions(token!)).pipe(
            catchError((error)=>{
              return throwError(error.error.message || 'Error desconocido');
            })
          );

   }


}
