-- MySQL dump 10.13  Distrib 8.0.28, for Linux (x86_64)
--
-- Host: localhost    Database: db_ventas
-- ------------------------------------------------------
-- Server version	8.0.28

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `almacen`
--

DROP TABLE IF EXISTS `almacen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `almacen` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(255) NOT NULL,
  `Locacion` varchar(255) NOT NULL,
  `Tipo` varchar(50) DEFAULT 'Mixto',
  `CapacidadMaxima` double DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `almacen`
--

LOCK TABLES `almacen` WRITE;
/*!40000 ALTER TABLE `almacen` DISABLE KEYS */;
INSERT INTO `almacen` VALUES (1,'Almacén Central','Zona Norte','mixto',5000),(2,'Almacén Insumos','Zona Sur','insumo',3000),(3,'Almacén Productos','Zona Este','producto',2000),(4,'Almacén Refrigerado','Zona Oeste','mixto',1500),(5,'Bodega Sur','calle sur, vereda 3','producto',20000),(6,'Almacen3','calle tarija12','producto',12000);
/*!40000 ALTER TABLE `almacen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) NOT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (1,'Pan Dulce','Producto'),(2,'Pan Salado','Producto'),(3,'Pastelería','Producto'),(4,'Galletas','Producto'),(5,'Harinas','Insumo'),(6,'Lácteos','Insumo'),(7,'Huevos','Insumo'),(8,'Azúcares','Insumo'),(9,'Levaduras','Insumo'),(10,'Aceite','Insumo'),(11,'huvos','Producto');
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(255) NOT NULL,
  `Apellidos` varchar(255) NOT NULL,
  `Celular` int DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (1,'Ana','González',70001001),(2,'Luis','Ramírez',70001002),(3,'Martha','Sánchez',70001003),(4,'Dennise','Apaza',637462664),(5,'Edwin','Calle',0),(6,'lizt','sss',76543210),(7,'malva','visco',9931293);
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_venta`
--

DROP TABLE IF EXISTS `detalle_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_venta` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ProductoAlmacenId` int NOT NULL,
  `VentaId` int NOT NULL,
  `Cantidad` int NOT NULL,
  `Monto` double NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `ProductoAlmacenId` (`ProductoAlmacenId`),
  KEY `VentaId` (`VentaId`),
  CONSTRAINT `detalle_venta_ibfk_1` FOREIGN KEY (`ProductoAlmacenId`) REFERENCES `producto_almacen` (`Id`),
  CONSTRAINT `detalle_venta_ibfk_2` FOREIGN KEY (`VentaId`) REFERENCES `ventas` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_venta`
--

LOCK TABLES `detalle_venta` WRITE;
/*!40000 ALTER TABLE `detalle_venta` DISABLE KEYS */;
INSERT INTO `detalle_venta` VALUES (1,11,1,10,410),(2,12,2,6,48),(3,13,3,15,30),(4,10,4,1,0.1),(5,10,5,1,0.1),(6,9,6,1,0.1),(7,10,7,1,0.1),(8,10,8,1,0.1),(9,9,9,12,12),(10,13,10,5,10),(11,12,11,3,24),(12,11,11,2,80),(13,9,12,5,0.5),(14,12,13,5,40),(15,9,14,1,0.1),(16,10,15,1,0.1),(17,10,16,1,0.1),(18,18,17,21,2.1),(19,18,18,21,2.1),(21,21,20,5,75),(22,9,21,9,0.9),(23,24,22,2,80),(24,25,22,2,0.2),(25,10,23,2,0.2),(27,10,26,1,0.1),(29,9,27,1,0.1),(30,11,28,4,160);
/*!40000 ALTER TABLE `detalle_venta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item`
--

DROP TABLE IF EXISTS `item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(255) NOT NULL,
  `Precio` double NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `unidad_medida` varchar(50) DEFAULT NULL,
  `categoria_id` int DEFAULT NULL,
  `Imagen` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `item_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item`
--

LOCK TABLES `item` WRITE;
/*!40000 ALTER TABLE `item` DISABLE KEYS */;
INSERT INTO `item` VALUES (1,'Pan de Muerto',25.5,'Producto','pieza',1,'https://cdn.pixabay.com/photo/2023/11/15/21/15/bread-8391079_1280.jpg'),(2,'Concha',0.1,'Producto','kg',1,'https://cdn.pixabay.com/photo/2021/01/14/13/10/bread-5916804_1280.jpg'),(3,'Bolillo',0.1,'Producto','kg',2,'https://cdn.pixabay.com/photo/2019/02/07/21/19/bobbin-lace-3982200_1280.jpg'),(4,'Pastel de Chocolate',40,'Producto','kg',3,'https://cdn.pixabay.com/photo/2016/11/22/18/52/cake-1850011_1280.jpg'),(5,'Galleta María',8,'Producto','pieza',4,'https://cdn.pixabay.com/photo/2014/11/27/14/35/cookies-547636_1280.jpg'),(6,'Pan Batalla',2,'Producto','unidad',2,'https://cdn.pixabay.com/photo/2018/06/12/22/29/bread-3471667_1280.jpg'),(7,'Torta 3 leches',15,'Producto','unidad',3,'https://images.pexels.com/photos/32590852/pexels-photo-32590852.jpeg'),(8,'Harina de Trigo',18.5,'Insumo','kg',5,NULL),(9,'Mantequilla',85,'Insumo','kg',6,NULL),(10,'Huevo',32,'Insumo','pieza',7,NULL),(11,'Azúcar Estándar',22,'Insumo','kg',8,NULL),(12,'Levadura Seca',15,'Insumo','sobre',9,NULL),(13,'Leche soya',10,'Insumo','L',6,NULL),(14,'Aceite fino',15,'Insumo','L',10,NULL);
/*!40000 ALTER TABLE `item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto_almacen`
--

DROP TABLE IF EXISTS `producto_almacen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto_almacen` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `item_id` int NOT NULL,
  `AlmacenId` int NOT NULL,
  `Stock` int NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `item_id` (`item_id`),
  KEY `AlmacenId` (`AlmacenId`),
  CONSTRAINT `producto_almacen_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `item` (`Id`),
  CONSTRAINT `producto_almacen_ibfk_2` FOREIGN KEY (`AlmacenId`) REFERENCES `almacen` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto_almacen`
--

LOCK TABLES `producto_almacen` WRITE;
/*!40000 ALTER TABLE `producto_almacen` DISABLE KEYS */;
INSERT INTO `producto_almacen` VALUES (1,8,1,410),(2,8,2,331),(3,9,2,129),(4,10,2,306),(5,11,2,161),(6,12,2,18),(7,13,2,518),(8,14,2,521),(9,2,3,70),(10,3,3,77),(11,4,3,104),(12,5,3,57),(13,6,3,50),(14,5,4,88),(15,9,4,235),(16,10,4,30),(17,2,5,50),(18,3,5,-42),(19,5,5,0),(20,6,5,230),(21,7,5,0),(22,7,6,5),(23,2,6,5),(24,4,2,18),(25,2,2,18),(26,4,5,20),(27,2,1,1);
/*!40000 ALTER TABLE `producto_almacen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transacciones_libelula`
--

DROP TABLE IF EXISTS `transacciones_libelula`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transacciones_libelula` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `VentaId` int NOT NULL,
  `Identificador` varchar(255) NOT NULL,
  `IdTransaccionLibelula` varchar(255) DEFAULT NULL,
  `CodigoRecaudacion` varchar(255) DEFAULT NULL,
  `Monto` double NOT NULL,
  `Estado` varchar(50) DEFAULT 'pendiente',
  `QrUrl` text,
  `UrlPasarela` text,
  `RespuestaApi` text,
  `FechaRegistro` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `VentaId` (`VentaId`),
  CONSTRAINT `transacciones_libelula_ibfk_1` FOREIGN KEY (`VentaId`) REFERENCES `ventas` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transacciones_libelula`
--

LOCK TABLES `transacciones_libelula` WRITE;
/*!40000 ALTER TABLE `transacciones_libelula` DISABLE KEYS */;
INSERT INTO `transacciones_libelula` VALUES (1,14,'OTTO-14-f76cdb0d','b05f6d77-2564-4d2a-992d-05494ea0bfeb','792414523402',0.1,'completado','https://pagos.libelula.bo/QrImages/355d3d4f31e04b46ab07e8e54c142e0acf0726235fae4825bbbd99b0c6f14b46.png','https://pagos.libelula.bo/?id=548ffabc-0017-44a3-9c4f-52e812bd0bfd','{\"error\":0,\"existente\":0,\"mensaje\":\"Deuda registrada con éxito. Para completar el pago, debe redireccionar al cliente a la pasarela de pagos.\",\"codigo_recaudacion\":\"792414523402\",\"id_transaccion\":\"b05f6d77-2564-4d2a-992d-05494ea0bfeb\",\"qr_simple_url\":\"https://pagos.libelula.bo/QrImages/355d3d4f31e04b46ab07e8e54c142e0acf0726235fae4825bbbd99b0c6f14b46.png\",\"url_pasarela_pagos\":\"https://pagos.libelula.bo/?id=548ffabc-0017-44a3-9c4f-52e812bd0bfd\"}','2026-07-07 13:13:49'),(2,15,'OTTO-15-57e1300f','e61a11a9-8227-42a1-a03a-9b993bcf3a8b','786614523771',0.1,'pendiente','https://pagos.libelula.bo/QrImages/7558dac0846d462e99cf908d684f7ee27faba789b44849dcbdf4e85a303f5ddc.png','https://pagos.libelula.bo/?id=ea981bca-0d12-415d-a905-489b889cdd66','{\"error\":0,\"existente\":0,\"mensaje\":\"Deuda registrada con éxito. Para completar el pago, debe redireccionar al cliente a la pasarela de pagos.\",\"codigo_recaudacion\":\"786614523771\",\"id_transaccion\":\"e61a11a9-8227-42a1-a03a-9b993bcf3a8b\",\"qr_simple_url\":\"https://pagos.libelula.bo/QrImages/7558dac0846d462e99cf908d684f7ee27faba789b44849dcbdf4e85a303f5ddc.png\",\"url_pasarela_pagos\":\"https://pagos.libelula.bo/?id=ea981bca-0d12-415d-a905-489b889cdd66\"}','2026-07-07 13:28:46'),(3,16,'OTTO-16-55528380','a2501056-a703-42a4-9533-6713b205b801','773314524428',0.1,'completado','https://pagos.libelula.bo/QrImages/57e1487d6f6a4c11b86fc57933d30bfa3d436982cc2a4d24a30e6c1ef37bb1f3.png','https://pagos.libelula.bo/?id=7ae3de3d-7244-46bb-9c67-2f5caac29643','{\"error\":0,\"existente\":0,\"mensaje\":\"Deuda registrada con éxito. Para completar el pago, debe redireccionar al cliente a la pasarela de pagos.\",\"codigo_recaudacion\":\"773314524428\",\"id_transaccion\":\"a2501056-a703-42a4-9533-6713b205b801\",\"qr_simple_url\":\"https://pagos.libelula.bo/QrImages/57e1487d6f6a4c11b86fc57933d30bfa3d436982cc2a4d24a30e6c1ef37bb1f3.png\",\"url_pasarela_pagos\":\"https://pagos.libelula.bo/?id=7ae3de3d-7244-46bb-9c67-2f5caac29643\"}','2026-07-07 13:51:49'),(4,26,'OTTO-26-981b1201','c5d0f5bc-3cb6-4713-b9c1-82b872c6b93f','703914552404',0.1,'completado','https://pagos.libelula.bo/QrImages/a5e877471e0f4b6c82cc1e32545b25fe02f763dd34a64c3db222ae136cef1aae.png','https://pagos.libelula.bo/?id=e57e238f-8423-4826-8ff3-6ffa9df65043','{\"error\":0,\"existente\":0,\"mensaje\":\"Deuda registrada con éxito. Para completar el pago, debe redireccionar al cliente a la pasarela de pagos.\",\"codigo_recaudacion\":\"703914552404\",\"id_transaccion\":\"c5d0f5bc-3cb6-4713-b9c1-82b872c6b93f\",\"qr_simple_url\":\"https://pagos.libelula.bo/QrImages/a5e877471e0f4b6c82cc1e32545b25fe02f763dd34a64c3db222ae136cef1aae.png\",\"url_pasarela_pagos\":\"https://pagos.libelula.bo/?id=e57e238f-8423-4826-8ff3-6ffa9df65043\"}','2026-07-08 17:53:45'),(5,27,'OTTO-27-f0e0e991','301192ee-aa29-478c-913e-471d6393fe65','703214552716',0.1,'completado','https://pagos.libelula.bo/QrImages/5039ca0d270243188e2187dbb0df2fda91adbd82bc144a108cfac91af3c702c2.png','https://pagos.libelula.bo/?id=5ac5063d-773e-4687-90ce-a40d506e591a','{\"error\":0,\"existente\":0,\"mensaje\":\"Deuda registrada con éxito. Para completar el pago, debe redireccionar al cliente a la pasarela de pagos.\",\"codigo_recaudacion\":\"703214552716\",\"id_transaccion\":\"301192ee-aa29-478c-913e-471d6393fe65\",\"qr_simple_url\":\"https://pagos.libelula.bo/QrImages/5039ca0d270243188e2187dbb0df2fda91adbd82bc144a108cfac91af3c702c2.png\",\"url_pasarela_pagos\":\"https://pagos.libelula.bo/?id=5ac5063d-773e-4687-90ce-a40d506e591a\"}','2026-07-08 18:00:23');
/*!40000 ALTER TABLE `transacciones_libelula` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Fecha` datetime DEFAULT NULL,
  `ClienteId` int NOT NULL,
  `UsuarioId` int NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `ClienteId` (`ClienteId`),
  CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`ClienteId`) REFERENCES `cliente` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas`
--

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
INSERT INTO `ventas` VALUES (1,'2025-02-01 00:00:00',1,1),(2,'2025-02-01 00:00:00',2,1),(3,'2025-02-01 00:00:00',3,1),(4,'2025-02-01 00:00:00',4,1),(5,'2025-02-01 00:00:00',4,1),(6,'2025-02-01 00:00:00',4,1),(7,'2025-02-01 00:00:00',3,1),(8,'2025-02-01 00:00:00',3,1),(9,'2026-05-27 00:00:00',2,1),(10,'2026-05-27 00:00:00',3,1),(11,'2025-05-01 00:00:00',1,1),(12,'2025-05-01 00:00:00',4,1),(13,'2025-05-01 00:00:00',4,1),(14,'2026-07-07 13:13:45',5,1),(15,'2026-07-07 13:28:43',5,1),(16,'2026-07-07 13:51:45',7,1),(17,'2026-07-07 00:00:00',1,1),(18,'2026-07-07 00:00:00',1,1),(19,'2026-07-07 00:00:00',1,1),(20,'2026-07-07 00:00:00',1,1),(21,'2026-07-08 00:00:00',2,1),(22,'2026-07-08 00:00:00',3,1),(23,'2026-07-08 17:16:06',1,1),(26,'2026-07-08 17:53:42',5,1),(27,'2026-07-08 18:00:18',5,1),(28,'2026-07-08 18:01:43',1,1);
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-08 22:47:07
