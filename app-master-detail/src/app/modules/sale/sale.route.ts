import { Routes } from '@angular/router';
import { SaleAddComponent } from './sale-add/sale-add.component';
import { SaleComponent } from './sale.component';
import { SaleListComponent } from './sale-list/sale-list.component';

export const sale_routes: Routes = [
  {
    path: 'list',
    component: SaleListComponent,
  },
  {
    path: 'add',
    component: SaleAddComponent
  },
  {
    path: '**',
    redirectTo: 'list',
    pathMatch: 'full',
  },
];
