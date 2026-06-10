import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Customer } from '../../../interfaces/customer.interface';
import { environment } from '../../../../environments/environment.development';

const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // Asegúrate de enviar el token en el formato correcto
  })
});
@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  apiCustomer = `${environment.URL_SERVICIOS}/cliente`;

  constructor(private http: HttpClient) { }

  public getCustomerAll(): Observable<Customer[]> {
    const token = sessionStorage.getItem('token');  // Obtener el token del localStorage
    console.log('Token usado:', token); // Verificar el token
    if (token) {
      return this.http.get<Customer[]>(this.apiCustomer, httpOptions(token)).pipe(
        catchError(this.handleError('getCustomerAll', []))
      );
    } else {
      return of([]);  // Si no hay token, devuelve un array vacío
    }
  }
  // Obtener todos los clientes
  public getCustomerById(customerId:number): Observable<Customer | never[]> {
    const token = sessionStorage.getItem('token');  // Obtener el token del localStorage
    console.log('Token usado:', token); // Verificar el token
    if (token) {
      return this.http.get<Customer>(`${this.apiCustomer}/${customerId}`, httpOptions(token)).pipe(
        catchError(this.handleError('getCustomerById', []))
      );
    } else {
      return of();  // Si no hay token, devuelve un array vacío
    }
  }

    // Crear un nuevo cliente
    public createCustomer(customer: Customer): Observable<Customer> {
      const token = sessionStorage.getItem('token');  // Obtener el token del localStorage
      if (token) {
        return this.http.post<Customer>(this.apiCustomer, customer, httpOptions(token)).pipe(
          catchError(this.handleError('createCustomer', customer))
        );
      } else {
        return of(customer);  // Si no hay token, devuelve el cliente sin cambios
      }
    }

  // Actualizar un cliente
  public updateCustomer(customer: Customer): Observable<Customer> {
    const token = sessionStorage.getItem('token');  // Obtener el token del localStorage
    console.log("Update:",customer);
    if (token) {
      return this.http.put<Customer>(`${this.apiCustomer}/${customer.customerId}`, customer, httpOptions(token)).pipe(
        catchError(this.handleError('updateCustomer', customer))
      );
    } else {
      return of(customer);  // Si no hay token, devuelve el cliente sin cambios
    }
  }

  // Eliminar un cliente
  public deleteCustomer(idCustomer: number): Observable<any> {
    const token = sessionStorage.getItem('token');  // Obtener el token del localStorage
      return this.http.delete(`${this.apiCustomer}/${idCustomer}`, httpOptions(token!)).pipe(
        catchError((error)=>{
          return throwError(error.error.message || 'Error desconocido');
        })
      );

  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // Loguea el error para depuración
      return of(result as T); // Retorna el resultado predeterminado
    };
  }

}
