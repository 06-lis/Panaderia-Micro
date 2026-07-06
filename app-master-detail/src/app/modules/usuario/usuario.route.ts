import { Routes } from '@angular/router';

import { UsuarioListComponent } from './usuario-list/usuario-list.component';
import { UsuarioAddComponent } from './usuario-add/usuario-add.component';
import { UsuarioComponent } from './usuario.component';

export const usuario_routes: Routes = [
  {
    path: '',
    component: UsuarioComponent,
  },
  {
    path: 'list',
    component: UsuarioListComponent,
  },
  {
    path: 'add',
    component: UsuarioAddComponent
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./usuario-edit/usuario-edit.component').then(m => m.UsuarioEditComponent)
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
