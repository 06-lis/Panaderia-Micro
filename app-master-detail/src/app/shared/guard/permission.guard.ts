import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const permissionGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  if (typeof window === 'undefined') return true;

  const token = sessionStorage.getItem('token');
  if (!token) {
    router.navigate(['/']);
    return false;
  }

  const requiredPermission = route.data?.['permission'];
  if (!requiredPermission) {
    return true;
  }

  const roles = JSON.parse(sessionStorage.getItem('roles') || '[]');
  const userPermissions = roles.flatMap((rol: any) => rol?.permisos || []);
  const hasPermission = userPermissions.some((perm: any) => perm?.nombre_Permiso === requiredPermission);

  if (!hasPermission) {
    console.warn(`Acceso denegado a: ${state.url}. Permiso requerido: ${requiredPermission}`);
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
