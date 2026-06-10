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
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
