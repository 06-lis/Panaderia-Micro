-- 1. Limpiar relaciones de roles y permisos
TRUNCATE TABLE "Rol_Permiso_Usuario" CASCADE;
TRUNCATE TABLE "Rol_Permiso" CASCADE;
DELETE FROM "Permiso";
DELETE FROM "Rol";

-- Reiniciar secuencias de IDs para Roles y Permisos
ALTER SEQUENCE "Rol_ID_Rol_seq" RESTART WITH 1;
ALTER SEQUENCE "Permiso_ID_Permiso_seq" RESTART WITH 1;
ALTER SEQUENCE "Rol_Permiso_ID_Rol_Permiso_seq" RESTART WITH 1;
ALTER SEQUENCE "Rol_Permiso_Usuario_ID_Usuario_Rol_Permiso_seq" RESTART WITH 1;

-- 2. Insertar Roles
INSERT INTO "Rol" ("Nombre_Rol", "Descripcion") VALUES
('Administrador', 'Rol con privilegios completos para gestionar usuarios y configuraciones del sistema.'),
('Encargado ventas', 'Rol encargado de gestionar las ventas, los clientes y el inventario relacionado.'),
('Encargado compras', 'Rol encargado de gestionar las compras, proveedores e inventario.'),
('Encargado produccion', 'Rol encargado de gestionar recetas, tablero de producción e inventario.'),
('Empleado basico', 'Acceso básico de visualización e inventario.');

-- 3. Insertar Permisos correspondientes a los nombres de permiso de la barra lateral (app.routes.ts)
INSERT INTO "Permiso" ("Nombre_Permiso", "Descripcion") VALUES
('Usuario', 'Gestión de usuarios en el sistema'),
('Rol', 'Gestión de roles de seguridad'),
('Rol Permiso', 'Asignación de permisos a roles'),
('Asignacion Roles y Permisos', 'Asignar roles y permisos a usuarios'),
('Cliente', 'Gestión de clientes'),
('Items', 'Gestión de items (productos, insumos y categorías)'),
('Almacen', 'Gestión de almacenes'),
('Producto Almacen', 'Asignar productos/insumos a almacén'),
('Venta', 'Gestión de ventas'),
('Proveedor', 'Gestión de proveedores de compras'),
('Nota Compra', 'Gestión de notas de compra'),
('Produccion', 'Gestión de recetas y tablero de producción'),
('Lotes Inventario', 'Visualizar y gestionar lotes de inventario'),
('Movimientos', 'Ver historial de movimientos de inventario'),
('Traspasos', 'Registrar traspasos entre almacenes'),
('Configuracion Inventario', 'Configuración de parámetros de inventario'),
('Reportes', 'Acceso al dashboard de reportes y métricas');

-- 4. Insertar relación entre Roles y Permisos (Rol_Permiso)
-- Administrador (ID_Rol 1) -> Obtiene todos los permisos (1 al 17)
INSERT INTO "Rol_Permiso" ("ID_Rol", "ID_Permiso") VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12), (1, 13), (1, 14), (1, 15), (1, 16), (1, 17);

-- Encargado ventas (ID_Rol 2) -> Cliente, Items, Almacen, Producto Almacen, Venta, Lotes Inventario, Movimientos, Traspasos
INSERT INTO "Rol_Permiso" ("ID_Rol", "ID_Permiso") VALUES
(2, 5),  -- Cliente (Permiso ID 5)
(2, 6),  -- Items (Permiso ID 6)
(2, 7),  -- Almacen (Permiso ID 7)
(2, 8),  -- Producto Almacen (Permiso ID 8)
(2, 9),  -- Venta (Permiso ID 9)
(2, 13), -- Lotes Inventario (Permiso ID 13)
(2, 14), -- Movimientos (Permiso ID 14)
(2, 15); -- Traspasos (Permiso ID 15)

-- Encargado compras (ID_Rol 3) -> Items, Almacen, Proveedor, Nota Compra, Lotes Inventario, Movimientos, Traspasos
INSERT INTO "Rol_Permiso" ("ID_Rol", "ID_Permiso") VALUES
(3, 6),  -- Items
(3, 7),  -- Almacen
(3, 10), -- Proveedor
(3, 11), -- Nota Compra
(3, 13), -- Lotes Inventario
(3, 14), -- Movimientos
(3, 15); -- Traspasos

-- Encargado produccion (ID_Rol 4) -> Items, Almacen, Produccion, Lotes Inventario, Movimientos, Traspasos
INSERT INTO "Rol_Permiso" ("ID_Rol", "ID_Permiso") VALUES
(4, 6),  -- Items
(4, 7),  -- Almacen
(4, 12), -- Produccion
(4, 13), -- Lotes Inventario
(4, 14), -- Movimientos
(4, 15); -- Traspasos

-- Empleado basico (ID_Rol 5) -> Almacen, Lotes Inventario, Movimientos, Traspasos
INSERT INTO "Rol_Permiso" ("ID_Rol", "ID_Permiso") VALUES
(5, 7),  -- Almacen
(5, 13), -- Lotes Inventario
(5, 14), -- Movimientos
(5, 15); -- Traspasos

-- 5. Vincular Usuarios a sus Roles correspondientes en la tabla de mapeo (Rol_Permiso_Usuario)
-- Edwin Calle (UserId 1) -> Administrador (Rol 1)
INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol_Permiso")
SELECT 1, "ID_Rol_Permiso" FROM "Rol_Permiso" WHERE "ID_Rol" = 1;

-- Carlos Gomez (UserId 2) -> Encargado ventas (Rol 2)
INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol_Permiso")
SELECT 2, "ID_Rol_Permiso" FROM "Rol_Permiso" WHERE "ID_Rol" = 2;

-- Carlos Ruiz (UserId 3) -> Empleado basico (Rol 5)
INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol_Permiso")
SELECT 3, "ID_Rol_Permiso" FROM "Rol_Permiso" WHERE "ID_Rol" = 5;

-- Admin User (UserId 4 y UserId 5) -> Administrador (Rol 1)
INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol_Permiso")
SELECT 4, "ID_Rol_Permiso" FROM "Rol_Permiso" WHERE "ID_Rol" = 1;

INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol_Permiso")
SELECT 5, "ID_Rol_Permiso" FROM "Rol_Permiso" WHERE "ID_Rol" = 1;

-- Dennis User (UserId 6) -> Administrador (Rol 1)
INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol_Permiso")
SELECT 6, "ID_Rol_Permiso" FROM "Rol_Permiso" WHERE "ID_Rol" = 1;

-- Compra User (UserId 7) -> Encargado compras (Rol 3)
INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol_Permiso")
SELECT 7, "ID_Rol_Permiso" FROM "Rol_Permiso" WHERE "ID_Rol" = 3;

-- Produccion User (UserId 8) -> Encargado produccion (Rol 4)
INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol_Permiso")
SELECT 8, "ID_Rol_Permiso" FROM "Rol_Permiso" WHERE "ID_Rol" = 4;

-- Empleado User (UserId 9) -> Empleado basico (Rol 5)
INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol_Permiso")
SELECT 9, "ID_Rol_Permiso" FROM "Rol_Permiso" WHERE "ID_Rol" = 5;

-- Mongo (UserId 10) -> Encargado produccion (Rol 4)
INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol_Permiso")
SELECT 10, "ID_Rol_Permiso" FROM "Rol_Permiso" WHERE "ID_Rol" = 4;
