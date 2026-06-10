import { Routes } from '@angular/router';
import { AsignarProductoComponent } from './AsignarProducto.component';

export const asignar_producto_routes: Routes = [
  {
    path: '',
    component: AsignarProductoComponent,
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
