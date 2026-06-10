import { Routes } from '@angular/router';
import LoginComponent from './modules/auth/login/login.component';
import { DashboardLayoutComponent } from './shared/layouts/dashboardLayout/dashboardLayout.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.route').then(m => m.auth_routes),
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
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
        data: {
          icon: 'pi pi-tags',
          title: 'Categoría',
          description: 'Gestión de Categorías',
          permission: 'Categoria',
          section: 'Almacén e Inventario'
        },
      },
      {
        path: 'product',
        loadChildren: () =>
          import('./modules/product/product.route').then(m => m.product_routes),
        data: {
          icon: 'pi pi-shopping-cart',
          title: 'Producto',
          description: 'Gestión de Productos',
          permission: 'Producto',
          section: 'Almacén e Inventario'
        },
      },
      {
        path: 'insumo',
        loadChildren: () =>
          import('./modules/insumo/insumo.route').then(m => m.insumo_routes),
        data: {
          icon: 'pi pi-box',
          title: 'Insumo',
          description: 'Gestión de Insumos',
          permission: 'Insumo',
          section: 'Almacén e Inventario'
        },
      },
      {
        path: 'crear-item',
        loadComponent: () =>
          import('./modules/crear-item/crear-item.component').then(m => m.CrearItemComponent),
        data: {
          icon: 'pi pi-plus-circle',
          title: 'Crear Item',
          description: 'Creación de Producto o Insumo',
          permission: 'Producto',
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
        data: {
          icon: 'pi pi-list',
          title: 'Detalle de Compra',
          description: 'Detalle de Notas de Compra',
          permission: 'Detalle Compra',
          section: 'Compras'
        },
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
];