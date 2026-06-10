using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MSVenta.Seguridad.Models
{
    [Table("Empleado")]
    public class Empleado
    {
        [Key]
        [Column("id_empleado")]
        public int IdEmpleado { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; }

        [Column("apellido")]
        public string Apellido { get; set; }

        [Column("telefono")]
        public string Telefono { get; set; }

        [Column("direccion")]
        public string Direccion { get; set; }

        [Column("fecha_nac")]
        public DateTime? FechaNac { get; set; }

        [Column("sueldo")]
        public decimal? Sueldo { get; set; }

        [Column("edad")]
        public int? Edad { get; set; }

        // Navigation property
        public ICollection<Usuario> Usuarios { get; set; }
    }
}
