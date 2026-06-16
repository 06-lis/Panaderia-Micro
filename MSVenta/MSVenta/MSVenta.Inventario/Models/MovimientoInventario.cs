using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MSVenta.Inventario.Models
{
    [Table("movimientos_inventario")]
    public class MovimientoInventario
    {
        [Key]
        [Column("id_movimiento")]
        public int IdMovimiento { get; set; }

        [Column("id_lote")]
        public int? IdLote { get; set; }

        [Column("id_almacen")]
        public int IdAlmacen { get; set; }

        [Column("id_item")]
        public int IdItem { get; set; }

        [Column("tipo_movimiento")]
        public string TipoMovimiento { get; set; }

        [Column("cantidad", TypeName = "decimal(10, 2)")]
        public decimal Cantidad { get; set; }

        [Column("costo_unitario", TypeName = "decimal(10, 2)")]
        public decimal CostoUnitario { get; set; }

        [Column("costo_total", TypeName = "decimal(10, 2)")]
        public decimal CostoTotal { get; set; }

        [Column("fecha_movimiento")]
        public DateTime FechaMovimiento { get; set; }

        [Column("id_empleado")]
        public int? IdEmpleado { get; set; }

        [Column("referencia_id")]
        public int? ReferenciaId { get; set; }

        [Column("referencia_tipo")]
        public string ReferenciaTipo { get; set; }
    }
}
