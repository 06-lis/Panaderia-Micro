import { Routes } from '@angular/router';
import LoginComponent from './login/login.component';

export const auth_routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
