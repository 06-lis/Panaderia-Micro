import { Routes } from '@angular/router';

import { RolComponent } from './rol.component';
import { RolListComponent } from './rol-list/rol-list.component';
import { RolAddComponent } from './rol-add/rol-add.component';
import { RolPermisosComponent } from '../roles-permisos/rol-permisos/rol-permisos.component';
import { RolPermisoUsuarioComponent } from './rol-permiso-usuario/rol-permiso-usuario.component';

export const rol_routes: Routes = [
  {
    path: '',
    component: RolComponent,
  },
  {
    path: 'list',
    component: RolListComponent,
  },
  {
    path: 'add',
    component: RolAddComponent
  },
  { path: 'rolpermiso/:id', component: RolPermisosComponent },
  { path: 'rolpermisousuario/:id', component: RolPermisoUsuarioComponent },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
