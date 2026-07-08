import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @Input() routes: any[] = [];
  @Input() userPermissions: any[] = [];

  // All sections start expanded (empty = none collapsed)
  collapsedSections = signal<Set<string>>(new Set());

  get sections() {
    const grouped = new Map<string, any[]>();
    (this.routes || []).forEach(route => {
      const section = route.data?.section || 'Otros';
      if (!grouped.has(section)) grouped.set(section, []);
      grouped.get(section)!.push(route);
    });
    return Array.from(grouped, ([name, routes]) => ({ name, routes }));
  }

  hasVisibleRoutes(section: any): boolean {
    return (section.routes || []).some((route: any) => this.hasPermission(route.data?.permission));
  }

  isSectionCollapsed(name: string): boolean {
    return this.collapsedSections().has(name);
  }

  toggleSection(name: string): void {
    this.collapsedSections.update(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  hasPermission(permissionName: string): boolean {
    console.log(`[Sidebar] Checking permissionName: "${permissionName}", userPermissions:`, this.userPermissions);
    if (!permissionName) return true;
    if (!this.userPermissions?.length) {
      console.log(`[Sidebar] No userPermissions loaded or empty list. Returning false for: "${permissionName}"`);
      return false;
    }
    const hasPerm = this.userPermissions.some((p: any) => p?.nombre_Permiso === permissionName);
    console.log(`[Sidebar] Result for "${permissionName}": ${hasPerm}`);
    return hasPerm;
  }
}