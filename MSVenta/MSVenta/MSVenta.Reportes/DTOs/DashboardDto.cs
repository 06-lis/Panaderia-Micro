using System;
using System.Collections.Generic;

namespace MSVenta.Reportes.DTOs
{
    public class DashboardDto
    {
        public int TotalVentas { get; set; }
        public decimal IngresosTotales { get; set; }
        public int TotalCompras { get; set; }
        public decimal GastosTotales { get; set; }
        public int ProduccionesCompletadas { get; set; }
        public int InsumosBajoStock { get; set; }
        public int AlertasVencimiento { get; set; }

        public List<OperacionPorFechaDto> OperacionesPorFecha { get; set; } = new List<OperacionPorFechaDto>();
        public List<ProductoVencimientoDto> ProductosPorVencer { get; set; } = new List<ProductoVencimientoDto>();
        public List<ItemMasUsadoDto> ItemsMasUsados { get; set; } = new List<ItemMasUsadoDto>();
        public List<ProductoPocoStockDto> ProductosConPocoStock { get; set; } = new List<ProductoPocoStockDto>();
    }

    public class OperacionPorFechaDto
    {
        public string Fecha { get; set; } // Formato "MM/dd" o "yyyy-MM-dd"
        public int CantidadVentas { get; set; }
        public int CantidadCompras { get; set; }
        public decimal MontoVentas { get; set; }
        public decimal MontoCompras { get; set; }
    }

    public class ProductoVencimientoDto
    {
        public int IdLote { get; set; }
        public int IdItem { get; set; }
        public string NombreAlmacen { get; set; } // Se llenará en base al AlmacenId si lo tenemos, o el ID
        public DateTime? FechaVencimiento { get; set; }
        public decimal CantidadDisponible { get; set; }
        public string Estado { get; set; } // "Crítico", "Próximo"
    }

    public class ItemMasUsadoDto
    {
        public int IdProductoAlmacen { get; set; }
        public string NombreItem { get; set; }
        public int CantidadVendida { get; set; }
    }

    public class ProductoPocoStockDto
    {
        public int IdItem { get; set; }
        public string NombreItem { get; set; }
        public decimal StockTotal { get; set; }
    }
}
