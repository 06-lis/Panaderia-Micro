USE db_ventas;

CREATE TABLE IF NOT EXISTS transacciones_libelula (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  VentaId INT NOT NULL,
  Identificador VARCHAR(255) NOT NULL,
  IdTransaccionLibelula VARCHAR(255),
  CodigoRecaudacion VARCHAR(255),
  Monto DOUBLE NOT NULL,
  Estado VARCHAR(50) DEFAULT 'pendiente',
  QrUrl TEXT,
  UrlPasarela TEXT,
  RespuestaApi TEXT,
  FechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (VentaId) REFERENCES ventas(Id)
);

INSERT INTO categoria (Nombre) VALUES ('Panadería y Repostería');

-- Asumiendo que la nueva categoría obtiene ID 4
INSERT INTO item (Nombre, Precio, tipo, categoria_id, Imagen) VALUES
('Croissant Francés', 12.50, 'Producto', 4, '/images/croissant.png'),
('Pan Artesanal de Masa Madre', 25.00, 'Producto', 4, '/images/pan_artesanal.png'),
('Porción Torta de Chocolate', 18.00, 'Producto', 4, '/images/torta_chocolate.png'),
('Galletas de Avena (Pack 6)', 15.00, 'Producto', 4, '/images/galletas_avena.png');

-- Asumiendo que los nuevos items obtienen IDs 4, 5, 6, 7
-- Asignamos stock al AlmacénCentral (Id = 1)
INSERT INTO producto_almacen (item_id, AlmacenId, Stock) VALUES
(4, 1, 50),
(5, 1, 30),
(6, 1, 20),
(7, 1, 45);
