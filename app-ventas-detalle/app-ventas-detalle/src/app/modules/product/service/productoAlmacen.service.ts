import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProductoAlmacen } from '../../../interfaces/producto-almacen,interface,';
import { catchError, Observable, of } from 'rxjs';

const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // Asegúrate de enviar el token en el formato correcto
  })
});

@Injectable({
  providedIn: 'root'
})
export class ProductoAlmacenService {

  apiUrl:string = `${environment.URL_SERVICIOS}/productoalmacen`

    constructor(private http: HttpClient) { }

     // Obtener todos los clientes
      public getProductoAlmacenAll(): Observable<ProductoAlmacen[]> {
        const token = sessionStorage.getItem('token');  // Obtener el token del localStorage
        console.log('Token usado:', token); // Verificar el token
        if (token) {
          return this.http.get<ProductoAlmacen[]>(this.apiUrl, httpOptions(token)).pipe(
            catchError(this.handleError('getProductoAlmacenAll', []))
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
      public createProductoAlamcen(product: ProductoAlmacen): Observable<ProductoAlmacen> {
        const token = sessionStorage.getItem('token');
        if (token) {
          // Verificar que todos los campos sean válidos antes de enviar
          if (!product.productoId || !product.almacenId) {
            console.error('Faltan datos necesarios para crear el producto');
            return of({} as ProductoAlmacen); // Retorna un objeto vacío si falta algún dato
          }

          return this.http.post<ProductoAlmacen>(this.apiUrl, product, httpOptions(token)).pipe(
            catchError(this.handleError('addProductoAlmacen', product))
          );
        } else {
          console.error('No hay token disponible');
          return of({} as ProductoAlmacen);  // Retorna un objeto vacío si no hay token
        }
      }

      public deleteProduct(product_id: number):Observable<any> {
          const token = sessionStorage.getItem('token');  // Obtener el token del localStorage
          if (token) {
            return this.http.delete(`${this.apiUrl}/${product_id}`, httpOptions(token)).pipe(
              catchError(this.handleError('deleteProduct'))
            );
          } else {
            return of(null);  // Si no hay token, no hace nada
          }
     }

}
