-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS db_security;
USE db_security;

-- Tabla Usuario
DROP TABLE IF EXISTS Usuario;
CREATE TABLE Usuario (
  UserId INT NOT NULL AUTO_INCREMENT,
  Fullname VARCHAR(255) NOT NULL,
  Username VARCHAR(50) NOT NULL,
  Password VARCHAR(50) NOT NULL,
  PRIMARY KEY (UserId)
);

-- Tabla Permiso
DROP TABLE IF EXISTS Permiso;
CREATE TABLE Permiso (
  ID_Permiso INT NOT NULL AUTO_INCREMENT,
  Nombre_Permiso VARCHAR(50) NOT NULL,
  Descripcion VARCHAR(255) DEFAULT NULL,
  Fecha_Creacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ID_Permiso)
);

-- Tabla Rol
DROP TABLE IF EXISTS Rol;
CREATE TABLE Rol (
  ID_Rol INT NOT NULL AUTO_INCREMENT,
  Nombre_Rol VARCHAR(50) NOT NULL,
  Descripcion VARCHAR(255) DEFAULT NULL,
  Fecha_Creacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ID_Rol)
);

-- Tabla Rol_Permiso
DROP TABLE IF EXISTS Rol_Permiso;
CREATE TABLE Rol_Permiso (
  ID_Rol_Permiso INT NOT NULL AUTO_INCREMENT,
  ID_Rol INT NOT NULL,
  ID_Permiso INT NOT NULL,
  PRIMARY KEY (ID_Rol_Permiso),
  KEY ID_Rol (ID_Rol),
  KEY ID_Permiso (ID_Permiso),
  CONSTRAINT rol_permiso_ibfk_1 FOREIGN KEY (ID_Rol) REFERENCES Rol (ID_Rol) ON DELETE CASCADE,
  CONSTRAINT rol_permiso_ibfk_2 FOREIGN KEY (ID_Permiso) REFERENCES Permiso (ID_Permiso) ON DELETE CASCADE
);

-- Tabla Rol_Permiso_Usuario
DROP TABLE IF EXISTS Rol_Permiso_Usuario;
CREATE TABLE Rol_Permiso_Usuario (
  ID_Usuario_Rol_Permiso INT NOT NULL AUTO_INCREMENT,
  UserId INT NOT NULL,
  ID_Rol_Permiso INT NOT NULL,
  PRIMARY KEY (ID_Usuario_Rol_Permiso),
  KEY UserId (UserId),
  KEY ID_Rol_Permiso (ID_Rol_Permiso),
  CONSTRAINT rol_permiso_usuario_ibfk_1 FOREIGN KEY (UserId) REFERENCES Usuario (UserId) ON DELETE CASCADE,
  CONSTRAINT rol_permiso_usuario_ibfk_2 FOREIGN KEY (ID_Rol_Permiso) REFERENCES Rol_Permiso (ID_Rol_Permiso) ON DELETE CASCADE
);

-- Insertar Roles
INSERT INTO Rol (Nombre_Rol, Descripcion, Fecha_Creacion) VALUES
('Administrador', 'Rol con privilegios completos para gestionar usuarios, configuraciones y todos los aspectos del sistema.', CURRENT_DATE()),
('Encargado ventas', 'Rol encargado de gestionar las ventas, los clientes y el inventario relacionado con las ventas.', CURRENT_DATE());

-- Insertar Permisos
INSERT INTO Permiso (Nombre_Permiso, Descripcion, Fecha_Creacion) VALUES
('Rol', 'Gestión de roles en el sistema', CURRENT_DATE()),
('Permiso', 'Gestión de permisos en el sistema', CURRENT_DATE()),
('Rol Permiso', 'Asignación de permisos a roles', CURRENT_DATE()),
('Usuario', 'Gestión de usuarios', CURRENT_DATE()),
('Asignacion Roles y Permisos', 'Asignar roles y permisos a usuarios', CURRENT_DATE()),
('Cliente', 'Gestión de clientes', CURRENT_DATE()),
('Categoria', 'Gestión de categorías de productos', CURRENT_DATE()),
('Producto', 'Gestión de productos', CURRENT_DATE()),
('Almacen', 'Gestión de almacenes', CURRENT_DATE()),
('Producto Almacen', 'Gestión del stock de productos en almacenes', CURRENT_DATE()),
('Venta', 'Gestión de ventas', CURRENT_DATE());



-- Insertar Usuarios
INSERT INTO Usuario (Fullname, Username, Password) VALUES
('Edwin Calle', 'edwincalle', 'ect*123'),
('Carlos Gomez', 'carlosgomez', 'cga*456'),
('Carlos Ruiz', 'carlosruiz', 'password789');

-- Insertar relaciones entre Roles y Permisos
INSERT INTO Rol_Permiso (ID_Rol, ID_Permiso) VALUES
(1, 1), -- Administrador tiene permiso de gestión de roles
(1, 2), -- Administrador tiene permiso de gestión de permisos
(1, 3), -- Administrador tiene permiso de asignación de permisos a roles
(1, 4), -- Administrador tiene permiso de gestión de usuarios
(1, 5), -- Administrador tiene permiso de asignación de roles y permisos a usuarios
(2, 6), -- Encargado ventas tiene permiso de gestión de clientes
(2, 7), -- Encargado ventas tiene permiso de gestión de categorías
(2, 8), -- Encargado ventas tiene permiso de gestión de productos
(2, 9), -- Encargado ventas tiene permiso de gestión de almacenes
(2, 10), -- Encargado ventas tiene permiso de gestión de stock de productos en almacenes
(2, 11); -- Encargado ventas tiene permiso de gestión de ventas

-- Insertar relaciones entre Roles, Permisos y Usuarios
-- Asignación de roles a los usuarios
INSERT INTO Rol_Permiso_Usuario (UserId, ID_Rol_Permiso) VALUES
(1, 1), -- Edwin Calle tiene el rol de Administrador con permisos completos
(1, 2), -- Edwin Calle tiene el rol de Administrador con permisos completos
(1, 3), -- Edwin Calle tiene el rol de Administrador con permisos completos
(1, 4), -- Edwin Calle tiene el rol de Administrador con permisos completos
(1, 5), -- Edwin Calle tiene el rol de Administrador con permisos completos
(1, 6), -- Edwin Calle tiene el rol de Administrador con permisos completos
(1, 7), -- Edwin Calle tiene el rol de Administrador con permisos completos
(1, 8), -- Edwin Calle tiene el rol de Administrador con permisos completos
(1, 9), -- Edwin Calle tiene el rol de Administrador con permisos completos
(1, 10), -- Edwin Calle tiene el rol de Administrador con permisos completos
(1, 11), -- Edwin Calle tiene el rol de Administrador con permisos completos
(2, 6), -- Carlos Gomez tiene el rol de Encargado ventas con permisos relacionados
(2, 7), -- Carlos Gomez tiene el rol de Encargado ventas con permisos relacionados
(2, 8), -- Carlos Gomez tiene el rol de Encargado ventas con permisos relacionados
(2, 9), -- Carlos Gomez tiene el rol de Encargado ventas con permisos relacionados
(2, 10), -- Carlos Gomez tiene el rol de Encargado ventas con permisos relacionados
(2, 11); -- Carlos Gomez tiene el rol de Encargado ventas con permisos relacionados



-- Trigger para asignar automáticamente permisos a los usuarios de un rol

DELIMITER $$

CREATE TRIGGER after_insert_rol_permiso
AFTER INSERT ON Rol_Permiso
FOR EACH ROW
BEGIN
    -- Insertar automáticamente el nuevo permiso a todos los usuarios que tienen el rol correspondiente,
    -- pero solo si no tienen ya el permiso asignado.
    INSERT INTO Rol_Permiso_Usuario (UserId, ID_Rol_Permiso)
    SELECT DISTINCT rpu.UserId, NEW.ID_Rol_Permiso
    FROM Rol_Permiso_Usuario rpu
    WHERE rpu.ID_Rol_Permiso IN (
        SELECT ID_Rol_Permiso 
        FROM Rol_Permiso 
        WHERE ID_Rol = NEW.ID_Rol
    )
    AND NOT EXISTS (
        SELECT 1 
        FROM Rol_Permiso_Usuario rpu2
        WHERE rpu2.UserId = rpu.UserId 
        AND rpu2.ID_Rol_Permiso = NEW.ID_Rol_Permiso
    );
END $$

DELIMITER ;
