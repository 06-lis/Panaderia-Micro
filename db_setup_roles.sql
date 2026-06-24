-- Insert into Rol_Permiso
INSERT INTO "Rol_Permiso" ("ID_Rol", "ID_Permiso")
SELECT r."ID_Rol", p."ID_Permiso"
FROM "Rol" r, "Permiso" p
WHERE r."Nombre_Rol" = 'Encargado compras' AND p."ID_Permiso" IN (13, 14, 15, 12, 9)
ON CONFLICT DO NOTHING;

INSERT INTO "Rol_Permiso" ("ID_Rol", "ID_Permiso")
SELECT r."ID_Rol", p."ID_Permiso"
FROM "Rol" r, "Permiso" p
WHERE r."Nombre_Rol" = 'Encargado produccion' AND p."ID_Permiso" IN (16, 8, 7, 9, 12, 10)
ON CONFLICT DO NOTHING;

INSERT INTO "Rol_Permiso" ("ID_Rol", "ID_Permiso")
SELECT r."ID_Rol", p."ID_Permiso"
FROM "Rol" r, "Permiso" p
WHERE r."Nombre_Rol" = 'Empleado basico' AND p."ID_Permiso" IN (8)
ON CONFLICT DO NOTHING;

-- Now link Users to all Rol_Permiso of their assigned Rol
-- admin
INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol_Permiso")
SELECT u."UserId", rp."ID_Rol_Permiso"
FROM "Usuario" u, "Rol_Permiso" rp, "Rol" r
WHERE u."Username" = 'admin@panaderia-otto.shop' AND r."Nombre_Rol" = 'Administrador' AND rp."ID_Rol" = r."ID_Rol";

-- dennis
INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol_Permiso")
SELECT u."UserId", rp."ID_Rol_Permiso"
FROM "Usuario" u, "Rol_Permiso" rp, "Rol" r
WHERE u."Username" = 'dennis@panaderia-otto.shop' AND r."Nombre_Rol" = 'Administrador' AND rp."ID_Rol" = r."ID_Rol";

-- compra
INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol_Permiso")
SELECT u."UserId", rp."ID_Rol_Permiso"
FROM "Usuario" u, "Rol_Permiso" rp, "Rol" r
WHERE u."Username" = 'compra@panaderia-otto.shop' AND r."Nombre_Rol" = 'Encargado compras' AND rp."ID_Rol" = r."ID_Rol";

-- produccion
INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol_Permiso")
SELECT u."UserId", rp."ID_Rol_Permiso"
FROM "Usuario" u, "Rol_Permiso" rp, "Rol" r
WHERE u."Username" = 'produccion@panaderia-otto.shop' AND r."Nombre_Rol" = 'Encargado produccion' AND rp."ID_Rol" = r."ID_Rol";

-- empleado
INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol_Permiso")
SELECT u."UserId", rp."ID_Rol_Permiso"
FROM "Usuario" u, "Rol_Permiso" rp, "Rol" r
WHERE u."Username" = 'empleado@panaderia-otto.shop' AND r."Nombre_Rol" = 'Empleado basico' AND rp."ID_Rol" = r."ID_Rol";

