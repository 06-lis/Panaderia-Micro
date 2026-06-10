import { Routes } from '@angular/router';
import { AlmacenAddComponent } from './almacen-add/almacen-add.component';
import { AlmacenEditComponent } from './almacen-edit/almacen-edit.component';
import { AlmacenListComponent } from './almacen-list/almacen-list.component';
import { AlmacenComponent } from './almacen.component';

export const almacen_routes: Routes = [
  {
    path: '',
    component: AlmacenComponent,
  },
  {
    path: 'list',
    component: AlmacenListComponent,
  },
  {
    path: 'add',
    component: AlmacenAddComponent
  },
  { path: 'edit/:id', component: AlmacenEditComponent },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
