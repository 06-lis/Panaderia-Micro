import { Routes } from '@angular/router';

export const detalle_compra_routes: Routes = [
  {
    path: ':id',
    loadComponent: () =>
      import('./detalle-compra.component').then(m => m.DetalleCompraComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./detalle-compra.component').then(m => m.DetalleCompraComponent),
  },
];
