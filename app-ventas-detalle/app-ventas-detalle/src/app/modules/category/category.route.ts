import { Routes } from '@angular/router';
import { CategoryListComponent } from './category-list/category-list.component';
import { CategoryAddComponent } from './category-add/category-add.component';

export const category_routes: Routes = [
  {
    path: 'list',
    component: CategoryListComponent,
  },
  {
    path: 'add',
    component: CategoryAddComponent
  },
  // { path: 'edit/:id', component: CustomerEditComponent },
  {
    path: '**',
    redirectTo: 'list',
    pathMatch: 'full',
  },
];
