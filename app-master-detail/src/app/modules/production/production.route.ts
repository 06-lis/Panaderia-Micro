import { Routes } from '@angular/router';
import { ProductionComponent } from './production.component';

export const production_routes: Routes = [
  {
    path: '',
    component: ProductionComponent
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
