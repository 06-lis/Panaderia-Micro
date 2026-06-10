import { Routes } from '@angular/router';
import { RolesPermisosUsuarioComponent } from './roles-permisos-usuario.component';
import { RolesPermisosUsuarioAddComponent } from './roles-permisos-usuario-add/roles-permisos-usuario-add.component';

export const roles_permisos_usuario_routes: Routes = [
  {
    path: '',
    component: RolesPermisosUsuarioComponent,
  },
   {
     path: 'add/:id',
     component: RolesPermisosUsuarioAddComponent
   },
  // { path: 'rolpermiso/:id', component: RolPermisosComponent },
  // { path: 'rolpermisousuario/:id', component: RolPermisoUsuarioComponent },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
