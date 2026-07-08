import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { routes } from '../../../app.routes';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { Rol } from '../../../interfaces/rol.interface';
import { Permiso } from '../../../interfaces/permiso.interface';
import { User } from '../../../interfaces/user.interface';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-layout',
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent
  ],
  templateUrl: './dashboardLayout.component.html',
  styleUrl: './dashboardLayout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardLayoutComponent implements OnInit {

  public userPermissions: any[] = [];
  user: User | undefined;
  isSidebarOpen = false;

  public routes: any[] = routes.find(r => r.path === 'dashboard')?.children?.filter((route) => route.data) || [];

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (typeof window !== 'undefined' && window.innerWidth < 640) {
        this.isSidebarOpen = false;
      }
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    const permissions = JSON.parse(sessionStorage.getItem('roles') || '[]');
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.user = user;
    this.userPermissions = permissions.flatMap((rol: any) => rol?.permisos || []);
    console.log('Permisos del usuario:', this.userPermissions);

    if (typeof window !== 'undefined') {
      this.isSidebarOpen = window.innerWidth >= 640;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.cdr.markForCheck();
  }

  hasPermission(permissionName: string): boolean {
    if (!permissionName) return true;
    if (!this.userPermissions || this.userPermissions.length === 0) return true;
    return this.userPermissions.some((perm: any) => perm?.nombre_Permiso === permissionName);
  }

  logout() {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('roles');
    sessionStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}
