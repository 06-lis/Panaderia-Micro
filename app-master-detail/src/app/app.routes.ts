import { Routes } from '@angular/router';
import LoginComponent from './modules/auth/login/login.component';
import { DashboardLayoutComponent } from './shared/layouts/dashboardLayout/dashboardLayout.component';
import { permissionGuard } from './shared/guard/permission.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.route').then(m => m.auth_routes),
  },
  {
    path: 'principal',
    loadComponent: () => import('./modules/landing/landing.component').then(m => m.LandingComponent),
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivateChild: [permissionGuard],
    children: [
      // ==========================================
      // 🔐 CONTROL DE USUARIOS
      // ==========================================
      {
        path: 'user',
        loadChildren: () =>
          import('./modules/usuario/usuario.route').then(m => m.usuario_routes),
        data: {
          icon: 'pi pi-user',
          title: 'Usuario',
          description: 'Gestión de Usuarios',
          permission: 'Usuario',
          section: 'Control de Usuarios'
        },
      },
      {
        path: 'roles',
        loadChildren: () =>
          import('./modules/rol/rol.route').then(m => m.rol_routes),
        data: {
          icon: 'pi pi-users',
          title: 'Roles',
          description: 'Gestión de Roles',
          permission: 'Rol',
          section: 'Control de Usuarios'
        },
      },
      {
        path: 'roles-permisos',
        loadChildren: () =>
          import('./modules/roles-permisos/roles-permisos.route').then(m => m.roles_permisos_routes),
        data: {
          icon: 'pi pi-lock',
          title: 'Permisos a Roles',
          description: 'Asignación de Permisos a Roles',
          permission: 'Rol Permiso',
          section: 'Control de Usuarios'
        },
      },
      {
        path: 'roles-permisos-usuario',
        loadChildren: () =>
          import('./modules/roles-permisos-usuario/roles-permisos-usuario.route').then(m => m.roles_permisos_usuario_routes),
        data: {
          icon: 'pi pi-id-card',
          title: 'Roles a Usuarios',
          description: 'Asignación de Roles a Usuarios',
          permission: 'Asignacion Roles y Permisos',
          section: 'Control de Usuarios'
        },
      },
      {
        path: 'customer',
        loadChildren: () =>
          import('./modules/customer/customer.route').then(m => m.customer_routes),
        data: {
          icon: 'pi pi-address-book',
          title: 'Cliente',
          description: 'Gestión de Clientes',
          permission: 'Cliente',
          section: 'Control de Usuarios'
        },
      },

      // ==========================================
      // 🏬 ALMACÉN E INVENTARIO
      // ==========================================
      {
        path: 'items',
        loadComponent: () =>
          import('./modules/items/items.component').then(m => m.ItemsComponent),
        data: {
          icon: 'pi pi-box',
          title: 'Gestión de Items',
          description: 'Gestión de Productos, Insumos y Categorías',
          permission: 'Items',
          section: 'Almacén e Inventario'
        },
      },
      {
        path: 'almacen',
        loadChildren: () =>
          import('./modules/almacen/almacen.route').then(m => m.almacen_routes),
        data: {
          icon: 'pi pi-warehouse',
          title: 'Almacén',
          description: 'Gestión de Almacenes',
          permission: 'Almacen',
          section: 'Almacén e Inventario'
        },
      },
      {
        path: 'category',
        loadChildren: () =>
          import('./modules/category/category.route').then(m => m.category_routes),
      },
      {
        path: 'product',
        loadChildren: () =>
          import('./modules/product/product.route').then(m => m.product_routes),
      },
      {
        path: 'insumo',
        loadChildren: () =>
          import('./modules/insumo/insumo.route').then(m => m.insumo_routes),
      },
      {
        path: 'crear-item',
        loadComponent: () =>
          import('./modules/crear-item/crear-item.component').then(m => m.CrearItemComponent),
        data: {
          icon: 'pi pi-plus-circle',
          title: 'Crear Item',
          description: 'Creación de Producto o Insumo',
          permission: 'Items',
          section: 'Almacén e Inventario'
        },
      },
      {
        path: 'asignar-producto',
        loadChildren: () =>
          import('./modules/AsignarProducto/asignar-producto.route').then(m => m.asignar_producto_routes),
        data: {
          icon: 'pi pi-arrow-right-arrow-left',
          title: 'Asignar a Almacén',
          description: 'Asignar Producto/Insumo a Almacén',
          permission: 'Producto Almacen',
          section: 'Almacén e Inventario'
        },
      },

      // ==========================================
      // 💰 VENTAS
      // ==========================================
      {
        path: 'sale',
        loadChildren: () =>
          import('./modules/sale/sale.route').then(m => m.sale_routes),
        data: {
          icon: 'pi pi-dollar',
          title: 'Venta',
          description: 'Gestión de Ventas',
          permission: 'Venta',
          section: 'Ventas'
        },
      },

      // ==========================================
      // 🛒 COMPRAS
      // ==========================================
      {
        path: 'proveedor',
        loadChildren: () =>
          import('./modules/compras/proveedor/proveedor.route').then(m => m.proveedor_routes),
        data: {
          icon: 'pi pi-truck',
          title: 'Proveedores',
          description: 'Gestión de Proveedores',
          permission: 'Proveedor',
          section: 'Compras'
        },
      },
      {
        path: 'nota-compra',
        loadChildren: () =>
          import('./modules/compras/nota-compra/nota-compra.route').then(m => m.nota_compra_routes),
        data: {
          icon: 'pi pi-file-edit',
          title: 'Nota de Compra',
          description: 'Registro de Compras',
          permission: 'Nota Compra',
          section: 'Compras'
        },
      },
      {
        path: 'detalle-compra',
        loadChildren: () =>
          import('./modules/compras/detalle-compra/detalle-compra.route').then(m => m.detalle_compra_routes),
      },

      // ==========================================
      // 🍞 PRODUCCIÓN
      // ==========================================
      {
        path: 'produccion',
        loadChildren: () =>
          import('./modules/production/production.route').then(m => m.production_routes),
        data: {
          icon: 'pi pi-hammer',
          title: 'Producción',
          description: 'Gestión de Recetas y Tablero de Producción',
          permission: 'Produccion',
          section: 'Producción'
        },
      },

      // ==========================================
      // 📦 INVENTARIO (NUEVO)
      // ==========================================
      {
        path: 'inventario/lotes',
        loadComponent: () =>
          import('./modules/inventario/lotes/lotes.component').then(m => m.LotesComponent),
        data: {
          icon: 'pi pi-box',
          title: 'Lotes Inventario',
          description: 'Gestión de Lotes y Trazabilidad',
          permission: 'Lotes Inventario',
          section: 'Almacén e Inventario'
        },
      },
      {
        path: 'inventario/movimientos',
        loadComponent: () =>
          import('./modules/inventario/movimientos/movimientos.component').then(m => m.MovimientosComponent),
        data: {
          icon: 'pi pi-sort-alt',
          title: 'Movimientos',
          description: 'Historial de Movimientos de Inventario',
          permission: 'Movimientos',
          section: 'Almacén e Inventario'
        },
      },
      {
        path: 'inventario/traspasos',
        loadComponent: () =>
          import('./modules/inventario/traspasos/traspasos.component').then(m => m.TraspasosComponent),
        data: {
          icon: 'pi pi-arrow-right-arrow-left',
          title: 'Traspasos',
          description: 'Traspasos entre Almacenes',
          permission: 'Traspasos',
          section: 'Almacén e Inventario'
        },
      },
      {
        path: 'inventario/configuracion',
        loadComponent: () =>
          import('./modules/inventario/configuracion/configuracion.component').then(m => m.ConfiguracionComponent),
        data: {
          icon: 'pi pi-cog',
          title: 'Configuracion Inventario',
          description: 'Configuración de Parámetros de Inventario',
          permission: 'Configuracion Inventario',
          section: 'Almacén e Inventario'
        },
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./modules/reports/reports.module').then(m => m.ReportsModule),
        data: {
          icon: 'pi pi-chart-bar',
          title: 'Dashboard',
          description: 'Dashboard de Reportes y Métricas',
          permission: 'Reportes',
          section: 'Reportes'
        },
      },
    ],
  },
  {
    path: '',
    redirectTo: 'principal',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'principal',
    pathMatch: 'full',
  },
];