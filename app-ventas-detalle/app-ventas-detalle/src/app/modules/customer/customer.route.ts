import { Routes } from '@angular/router';
import { CustomerComponent } from './customer.component';
import CustomerAddComponent from './customer-add/customer-add.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerEditComponent } from './customer-edit/customer-edit.component';

export const customer_routes: Routes = [
  {
    path: 'list',
    component: CustomerListComponent,
  },
  {
    path: 'add',
    component: CustomerAddComponent
  },
  { path: 'edit/:id', component: CustomerEditComponent },
  {
    path: '**',
    redirectTo: 'list',
    pathMatch: 'full',
  },
];
