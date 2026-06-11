-- 1. Crear base de datos
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'db_produccion')
BEGIN
    CREATE DATABASE db_produccion;
END;
GO

USE db_produccion;
GO

-- Eliminar tablas existentes si ya existen para recrearlas limpiamente
IF OBJECT_ID('dbo.detalle_produccion', 'U') IS NOT NULL DROP TABLE dbo.detalle_produccion;
IF OBJECT_ID('dbo.producciones', 'U') IS NOT NULL DROP TABLE dbo.producciones;
IF OBJECT_ID('dbo.detalle_receta', 'U') IS NOT NULL DROP TABLE dbo.detalle_receta;
IF OBJECT_ID('dbo.recetas', 'U') IS NOT NULL DROP TABLE dbo.recetas;

-- 2. Crear tabla recetas
CREATE TABLE recetas (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(255) NOT NULL,
    Descripcion NVARCHAR(MAX) NULL,
    ProductoId INT NOT NULL,
    CantidadRequerida INT NOT NULL
);

-- 3. Crear tabla detalle_receta
CREATE TABLE detalle_receta (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    RecetaId INT NOT NULL,
    InsumoId INT NOT NULL,
    CantidadRequerida INT NOT NULL,
    CONSTRAINT FK_detalle_receta_recetas FOREIGN KEY (RecetaId) REFERENCES recetas(Id) ON DELETE CASCADE
);

-- 4. Crear tabla producciones
CREATE TABLE producciones (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FechaProduccion DATETIME NULL,
    CantidadProducida INT NOT NULL,
    EmpleadoSolicitaId INT NOT NULL,
    EmpleadoAutorizaId INT NULL,
    Estado NVARCHAR(50) NOT NULL, -- pendiente, aprobado, rechazado, cancelado
    FechaSolicitud DATETIME NOT NULL,
    FechaAutorizacion DATETIME NULL,
    Observaciones NVARCHAR(MAX) NULL
);

-- 5. Crear tabla detalle_produccion
CREATE TABLE detalle_produccion (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProduccionId INT NOT NULL,
    DetalleRecetaId INT NULL,
    AlmacenId INT NOT NULL,
    ItemId INT NOT NULL,
    Cantidad INT NOT NULL,
    TipoMovimiento NVARCHAR(50) NOT NULL, -- Ingreso, Egreso
    CONSTRAINT FK_detalle_produccion_producciones FOREIGN KEY (ProduccionId) REFERENCES producciones(Id) ON DELETE CASCADE,
    CONSTRAINT FK_detalle_produccion_detalle_receta FOREIGN KEY (DetalleRecetaId) REFERENCES detalle_receta(Id) ON DELETE SET NULL
);

-- Insertar datos de prueba iniciales (Receta de pan y producción)
INSERT INTO recetas (Nombre, Descripcion, ProductoId, CantidadRequerida) VALUES
('Pan Marraqueta (Lote de 100)', 'Receta estándar para hornear 100 panes marraqueta', 1, 100);

-- Suponiendo que los items (insumos) de la base de datos de ventas son harina (ID 1), levadura (ID 2), etc.
INSERT INTO detalle_receta (RecetaId, InsumoId, CantidadRequerida) VALUES
(1, 1, 50), -- 50 unidades de harina
(1, 2, 2);  -- 2 unidades de levadura
