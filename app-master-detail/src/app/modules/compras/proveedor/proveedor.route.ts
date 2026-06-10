import { Routes } from '@angular/router';

export const proveedor_routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./proveedor.component').then(m => m.ProveedorComponent),
  },
];
