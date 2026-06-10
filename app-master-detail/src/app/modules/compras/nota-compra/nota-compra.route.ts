import { Routes } from '@angular/router';

export const nota_compra_routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./nota-compra.component').then(m => m.NotaCompraComponent),
  },
];
