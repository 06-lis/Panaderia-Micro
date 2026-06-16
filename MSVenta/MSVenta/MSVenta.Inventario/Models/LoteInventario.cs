using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MSVenta.Inventario.Models
{
    [Table("lotes_inventario")]
    public class LoteInventario
    {
        [Key]
        [Column("id_lote")]
        public int IdLote { get; set; }

        [Column("id_almacen")]
        public int IdAlmacen { get; set; }

        [Column("id_item")]
        public int IdItem { get; set; }

        [Column("cantidad_inicial", TypeName = "decimal(10, 2)")]
        public decimal CantidadInicial { get; set; }

        [Column("cantidad_disponible", TypeName = "decimal(10, 2)")]
        public decimal CantidadDisponible { get; set; }

        [Column("precio_unitario", TypeName = "decimal(10, 2)")]
        public decimal PrecioUnitario { get; set; }

        [Column("fecha_entrada")]
        public DateTime FechaEntrada { get; set; }

        [Column("fecha_salida")]
        public DateTime? FechaSalida { get; set; }

        [Column("fecha_vencimiento", TypeName = "date")]
        public DateTime? FechaVencimiento { get; set; }

        [Column("metodo_valuacion")]
        public string MetodoValuacion { get; set; }

        [Column("estado")]
        public string Estado { get; set; }

        [Column("referencia_id")]
        public int? ReferenciaId { get; set; }

        [Column("referencia_tipo")]
        public string ReferenciaTipo { get; set; }
    }
}
