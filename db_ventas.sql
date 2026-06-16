DROP DATABASE IF EXISTS db_ventas;
CREATE DATABASE db_ventas;
USE db_ventas;

-- 1. Tabla cliente
CREATE TABLE cliente (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(255) NOT NULL,
  Apellidos VARCHAR(255) NOT NULL,
  Celular INT
);

-- 2. Tabla categoria
CREATE TABLE categoria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(100) NOT NULL
);

-- 3. Tabla item (TPH: Producto e Insumo)
CREATE TABLE item (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(255) NOT NULL,
  Precio DOUBLE NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- Discriminador: "Producto" o "Insumo"
  unidad_medida VARCHAR(50),
  categoria_id INT,
  Imagen VARCHAR(255), -- Propiedad exclusiva de Producto
  FOREIGN KEY (categoria_id) REFERENCES categoria(id)
);

-- 4. Tabla almacen
CREATE TABLE almacen (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(255) NOT NULL,
  Locacion VARCHAR(255) NOT NULL
);

-- 5. Tabla producto_almacen
CREATE TABLE producto_almacen (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  AlmacenId INT NOT NULL,
  Stock INT NOT NULL,
  FOREIGN KEY (item_id) REFERENCES item(Id),
  FOREIGN KEY (AlmacenId) REFERENCES almacen(Id)
);

-- 6. Tabla ventas
CREATE TABLE ventas (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Fecha DATETIME,
  ClienteId INT NOT NULL,
  UsuarioId INT NOT NULL,
  FOREIGN KEY (ClienteId) REFERENCES cliente(Id)
);

-- 7. Tabla detalle_venta
CREATE TABLE detalle_venta (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  ProductoAlmacenId INT NOT NULL,
  VentaId INT NOT NULL,
  Cantidad INT NOT NULL,
  Monto DOUBLE NOT NULL,
  FOREIGN KEY (ProductoAlmacenId) REFERENCES producto_almacen(Id),
  FOREIGN KEY (VentaId) REFERENCES ventas(Id)
);

-- Insertar datos iniciales de prueba
INSERT INTO cliente (Nombre, Apellidos, Celular) VALUES
('Juan', 'Pérez', 76543210),
('María', 'Gómez', 71234567),
('Carlos', 'López', 78901234);

INSERT INTO categoria (Nombre) VALUES
('Electrónica'),
('Ropa'),
('Alimentos');

INSERT INTO item (Nombre, Precio, tipo, categoria_id) VALUES
('Laptop HP', 1200.50, 'Producto', 1),
('Camiseta Nike', 25.99, 'Producto', 2),
('Chocolate Snickers', 1.50, 'Producto', 3);

INSERT INTO almacen (Nombre, Locacion) VALUES
('Almacén Central', 'Zona Industrial'),
('Sucursal Norte', 'Av. Bolívar');

INSERT INTO producto_almacen (item_id, AlmacenId, Stock) VALUES
(1, 1, 10),
(2, 2, 50),
(3, 1, 100);
