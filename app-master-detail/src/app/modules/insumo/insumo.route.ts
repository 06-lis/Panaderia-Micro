import { Routes } from '@angular/router';

export const insumo_routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./insumo.component').then(m => m.InsumoComponent)
  }
];