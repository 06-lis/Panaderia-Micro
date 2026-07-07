import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductEditComponent } from './product-edit/product-edit.component';
import { ProductComponent } from './product.component';

export const product_routes: Routes = [
  {
    path: 'list',
    component: ProductComponent,
  },
  { path: 'edit/:id', component: ProductEditComponent },
  {
    path: '**',
    redirectTo: 'list',
    pathMatch: 'full',
  },
];
