using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MSVenta.Inventario.Models
{
    [Table("traspasos_almacen_item")]
    public class TraspasoAlmacenItem
    {
        [Key]
        [Column("id_traspaso_item")]
        public int IdTraspasoItem { get; set; }

        [Column("id_traspaso")]
        public int IdTraspaso { get; set; }

        [Column("id_item")]
        public int IdItem { get; set; }

        [Column("cantidad", TypeName = "decimal(10, 2)")]
        public decimal Cantidad { get; set; }

        [Column("id_lote_origen")]
        public int? IdLoteOrigen { get; set; }

        [Column("id_lote_destino")]
        public int? IdLoteDestino { get; set; }
    }
}
