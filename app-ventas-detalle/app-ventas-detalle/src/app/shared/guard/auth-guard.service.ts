import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor() { }

  public getRoles(): string[] {
    const roles = sessionStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  }

  public hasRole(role: string): boolean {
    const roles = this.getRoles();
    return roles.includes(role);
  }

}
