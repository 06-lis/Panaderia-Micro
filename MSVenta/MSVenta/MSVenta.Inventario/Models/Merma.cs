using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MSVenta.Inventario.Models
{
    [Table("mermas")]
    public class Merma
    {
        [Key]
        [Column("id_merma")]
        public int IdMerma { get; set; }

        [Column("id_lote")]
        public int IdLote { get; set; }

        [Column("id_item")]
        public int IdItem { get; set; }

        [Column("id_almacen")]
        public int IdAlmacen { get; set; }

        [Column("cantidad", TypeName = "decimal(10, 2)")]
        public decimal Cantidad { get; set; }

        [Column("costo_unitario", TypeName = "decimal(10, 2)")]
        public decimal CostoUnitario { get; set; }

        [Column("costo_total", TypeName = "decimal(10, 2)")]
        public decimal CostoTotal { get; set; }

        [Column("fecha_merma")]
        public DateTime FechaMerma { get; set; }

        [Column("motivo")]
        public string Motivo { get; set; }

        [Column("id_empleado")]
        public int? IdEmpleado { get; set; }
    }
}
