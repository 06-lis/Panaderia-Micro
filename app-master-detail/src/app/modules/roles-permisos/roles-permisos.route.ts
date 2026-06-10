import { Routes } from '@angular/router';
import { RolesPermisosComponent } from './roles-permisos.component';
import { RolesPermisosAddComponent } from './roles-permisos-add/roles-permisos-add.component';

export const roles_permisos_routes: Routes = [
  {
    path: '',
    component: RolesPermisosComponent,
  },
   {
     path: 'add/:id',
     component: RolesPermisosAddComponent
   },
  // { path: 'rolpermiso/:id', component: RolPermisosComponent },
  // { path: 'rolpermisousuario/:id', component: RolPermisoUsuarioComponent },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
