-- Eliminar tablas existentes si ya existen para recrearlas limpiamente
DROP TABLE IF EXISTS "Rol_Permiso_Usuario" CASCADE;
DROP TABLE IF EXISTS "Rol_Permiso" CASCADE;
DROP TABLE IF EXISTS "Rol" CASCADE;
DROP TABLE IF EXISTS "Permiso" CASCADE;
DROP TABLE IF EXISTS "Usuario" CASCADE;
DROP TABLE IF EXISTS "Empleado" CASCADE;

-- 1. Crear tabla Empleado
CREATE TABLE "Empleado" (
    id_empleado SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    telefono VARCHAR(50),
    direccion VARCHAR(255),
    fecha_nac TIMESTAMP,
    sueldo DECIMAL(18,2),
    edad INTEGER
);

-- 2. Crear tabla Usuario
CREATE TABLE "Usuario" (
    "UserId" SERIAL PRIMARY KEY,
    "Fullname" VARCHAR(255) NOT NULL,
    "Username" VARCHAR(50) NOT NULL,
    "Password" VARCHAR(50) NOT NULL,
    id_empleado INTEGER,
    id_cliente INTEGER,
    CONSTRAINT fk_usuario_empleado FOREIGN KEY (id_empleado) REFERENCES "Empleado"(id_empleado) ON DELETE SET NULL
);

-- 3. Crear tabla Permiso
CREATE TABLE "Permiso" (
    "ID_Permiso" SERIAL PRIMARY KEY,
    "Nombre_Permiso" VARCHAR(50) NOT NULL,
    "Descripcion" VARCHAR(255),
    "Fecha_Creacion" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Crear tabla Rol
CREATE TABLE "Rol" (
    "ID_Rol" SERIAL PRIMARY KEY,
    "Nombre_Rol" VARCHAR(50) NOT NULL,
    "Descripcion" VARCHAR(255),
    "Fecha_Creacion" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Crear tabla Rol_Permiso
CREATE TABLE "Rol_Permiso" (
    "ID_Rol_Permiso" SERIAL PRIMARY KEY,
    "ID_Rol" INTEGER NOT NULL,
    "ID_Permiso" INTEGER NOT NULL,
    CONSTRAINT fk_rolpermiso_rol FOREIGN KEY ("ID_Rol") REFERENCES "Rol"("ID_Rol") ON DELETE CASCADE,
    CONSTRAINT fk_rolpermiso_permiso FOREIGN KEY ("ID_Permiso") REFERENCES "Permiso"("ID_Permiso") ON DELETE CASCADE
);

-- 6. Crear tabla Rol_Permiso_Usuario
CREATE TABLE "Rol_Permiso_Usuario" (
    "ID_Usuario_Rol_Permiso" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL,
    "ID_Rol_Permiso" INTEGER NOT NULL,
    CONSTRAINT fk_rpu_usuario FOREIGN KEY ("UserId") REFERENCES "Usuario"("UserId") ON DELETE CASCADE,
    CONSTRAINT fk_rpu_rolpermiso FOREIGN KEY ("ID_Rol_Permiso") REFERENCES "Rol_Permiso"("ID_Rol_Permiso") ON DELETE CASCADE
);

-- Insertar Roles predeterminados
INSERT INTO "Rol" ("Nombre_Rol", "Descripcion") VALUES
('Administrador', 'Rol con privilegios completos para gestionar usuarios y configuraciones del sistema.'),
('Encargado ventas', 'Rol encargado de gestionar las ventas, los clientes y el inventario relacionado.');

-- Insertar Permisos predeterminados (incluyendo los de Compras, Insumos y el nuevo módulo de Producción)
INSERT INTO "Permiso" ("Nombre_Permiso", "Descripcion") VALUES
('Rol', 'Gestión de roles en el sistema'),
('Permiso', 'Gestión de permisos en el sistema'),
('Rol Permiso', 'Asignación de permisos a roles'),
('Usuario', 'Gestión de usuarios'),
('Asignacion Roles y Permisos', 'Asignar roles y permisos a usuarios'),
('Cliente', 'Gestión de clientes'),
('Categoria', 'Gestión de categorías de productos'),
('Producto', 'Gestión de productos'),
('Almacen', 'Gestión de almacenes'),
('Producto Almacen', 'Gestión del stock de productos en almacenes'),
('Venta', 'Gestión de ventas'),
('Insumo', 'Gestión de insumos o materias primas'),
('Proveedor', 'Gestión de proveedores de compras'),
('Nota Compra', 'Gestión de notas de compra'),
('Detalle Compra', 'Ver detalles de las notas de compra'),
('Produccion', 'Gestión de recetas y tablero de producción de panadería');

-- Insertar Usuarios predeterminados
INSERT INTO "Usuario" ("Fullname", "Username", "Password") VALUES
('Edwin Calle', 'edwincalle', 'ect*123'),
('Carlos Gomez', 'carlosgomez', 'cga*456'),
('Carlos Ruiz', 'carlosruiz', 'password789');

-- Insertar relación entre Roles y Permisos
-- Administrador (Rol 1) obtiene TODOS los permisos (1 al 16)
INSERT INTO "Rol_Permiso" ("ID_Rol", "ID_Permiso") VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12), (1, 13), (1, 14), (1, 15), (1, 16);

-- Encargado ventas (Rol 2) obtiene permisos de ventas y almacén (6 al 11)
INSERT INTO "Rol_Permiso" ("ID_Rol", "ID_Permiso") VALUES
(2, 6), (2, 7), (2, 8), (2, 9), (2, 10), (2, 11);

-- Insertar relación entre Usuarios y sus Roles/Permisos
-- Edwin Calle (UserId 1) obtiene todos los accesos (Administrador completa - IDs de Rol_Permiso del 1 al 16)
INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol_Permiso") VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12), (1, 13), (1, 14), (1, 15), (1, 16);

-- Carlos Gomez (UserId 2) obtiene accesos de Ventas (IDs de Rol_Permiso correspondientes al Rol 2, que son del 17 al 22 en la secuencia)
INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol_Permiso") VALUES
(2, 17), (2, 18), (2, 19), (2, 20), (2, 21), (2, 22);
