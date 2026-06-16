using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MSVenta.Inventario.Models
{
    [Table("configuracion_inventario")]
    public class ConfiguracionInventario
    {
        [Key]
        [Column("clave")]
        public string Clave { get; set; }

        [Column("valor")]
        public string Valor { get; set; }
    }
}
