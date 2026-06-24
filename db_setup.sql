-- Insert Roles
INSERT INTO "Rol" ("Nombre_Rol", "Descripcion", "Fecha_Creacion")
VALUES 
('Encargado compras', 'Gestiona las compras, proveedores y almacén', NOW()),
('Encargado produccion', 'Gestiona producción, recetas y almacenes', NOW()),
('Empleado basico', 'Permisos de solo lectura para productos', NOW())
ON CONFLICT DO NOTHING;

-- We need their IDs, let's assume they get ID 3, 4, 5 but to be safe we use subqueries.
INSERT INTO "Rol_Permiso" ("ID_Rol", "ID_Permiso", "Fecha_Asignacion")
SELECT r."ID_Rol", p."ID_Permiso", NOW()
FROM "Rol" r, "Permiso" p
WHERE r."Nombre_Rol" = 'Encargado compras' AND p."ID_Permiso" IN (13, 14, 15, 12, 9)
ON CONFLICT DO NOTHING;

INSERT INTO "Rol_Permiso" ("ID_Rol", "ID_Permiso", "Fecha_Asignacion")
SELECT r."ID_Rol", p."ID_Permiso", NOW()
FROM "Rol" r, "Permiso" p
WHERE r."Nombre_Rol" = 'Encargado produccion' AND p."ID_Permiso" IN (16, 8, 7, 9, 12, 10)
ON CONFLICT DO NOTHING;

INSERT INTO "Rol_Permiso" ("ID_Rol", "ID_Permiso", "Fecha_Asignacion")
SELECT r."ID_Rol", p."ID_Permiso", NOW()
FROM "Rol" r, "Permiso" p
WHERE r."Nombre_Rol" = 'Empleado basico' AND p."ID_Permiso" IN (8)
ON CONFLICT DO NOTHING;

-- Insert Empleados
INSERT INTO "Empleado" ("nombre", "apellido", "telefono", "direccion") VALUES 
('Admin', 'Otto', '12345678', 'Panaderia'),
('Dennis', 'Otto', '12345678', 'Panaderia'),
('Compra', 'Otto', '12345678', 'Panaderia'),
('Produccion', 'Otto', '12345678', 'Panaderia'),
('Empleado', 'Otto', '12345678', 'Panaderia');

-- Insert Usuarios
INSERT INTO "Usuario" ("Fullname", "Username", "Password", "id_empleado")
SELECT 'Admin User', 'admin@panaderia-otto.shop', 'K8yB9tZq4MvP3wxR', id_empleado
FROM "Empleado" WHERE "nombre" = 'Admin';

INSERT INTO "Usuario" ("Fullname", "Username", "Password", "id_empleado")
SELECT 'Dennis User', 'dennis@panaderia-otto.shop', 'A6y3PNfyWT9dkhp/', id_empleado
FROM "Empleado" WHERE "nombre" = 'Dennis';

INSERT INTO "Usuario" ("Fullname", "Username", "Password", "id_empleado")
SELECT 'Compra User', 'compra@panaderia-otto.shop', 'EO35Ummfe7/fQYrv', id_empleado
FROM "Empleado" WHERE "nombre" = 'Compra';

INSERT INTO "Usuario" ("Fullname", "Username", "Password", "id_empleado")
SELECT 'Produccion User', 'produccion@panaderia-otto.shop', 'Qvu3t0zkpmDfYN+T', id_empleado
FROM "Empleado" WHERE "nombre" = 'Produccion';

INSERT INTO "Usuario" ("Fullname", "Username", "Password", "id_empleado")
SELECT 'Empleado User', 'empleado@panaderia-otto.shop', 'hY5e3qYBrtFlE/h7', id_empleado
FROM "Empleado" WHERE "nombre" = 'Empleado';

-- Assign Roles
-- admin
INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol", "Fecha_Asignacion")
SELECT u."UserId", r."ID_Rol", NOW()
FROM "Usuario" u, "Rol" r
WHERE u."Username" = 'admin@panaderia-otto.shop' AND r."Nombre_Rol" = 'Administrador';

-- dennis
INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol", "Fecha_Asignacion")
SELECT u."UserId", r."ID_Rol", NOW()
FROM "Usuario" u, "Rol" r
WHERE u."Username" = 'dennis@panaderia-otto.shop' AND r."Nombre_Rol" = 'Administrador';

-- compra
INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol", "Fecha_Asignacion")
SELECT u."UserId", r."ID_Rol", NOW()
FROM "Usuario" u, "Rol" r
WHERE u."Username" = 'compra@panaderia-otto.shop' AND r."Nombre_Rol" = 'Encargado compras';

-- produccion
INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol", "Fecha_Asignacion")
SELECT u."UserId", r."ID_Rol", NOW()
FROM "Usuario" u, "Rol" r
WHERE u."Username" = 'produccion@panaderia-otto.shop' AND r."Nombre_Rol" = 'Encargado produccion';

-- empleado
INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol", "Fecha_Asignacion")
SELECT u."UserId", r."ID_Rol", NOW()
FROM "Usuario" u, "Rol" r
WHERE u."Username" = 'empleado@panaderia-otto.shop' AND r."Nombre_Rol" = 'Empleado basico';

