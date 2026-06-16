using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MSVenta.Inventario.Models
{
    [Table("traspasos")]
    public class Traspaso
    {
        [Key]
        [Column("id_traspaso")]
        public int IdTraspaso { get; set; }

        [Column("id_almacen_origen")]
        public int IdAlmacenOrigen { get; set; }

        [Column("id_almacen_destino")]
        public int IdAlmacenDestino { get; set; }

        [Column("id_empleado")]
        public int IdEmpleado { get; set; }

        [Column("fecha_solicitud")]
        public DateTime FechaSolicitud { get; set; }

        [Column("fecha_aprobacion")]
        public DateTime? FechaAprobacion { get; set; }

        [Column("estado")]
        public string Estado { get; set; }

        [Column("observaciones")]
        public string Observaciones { get; set; }
    }
}
