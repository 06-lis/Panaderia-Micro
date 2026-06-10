using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace MSVenta.Venta.Models
{
    public class Almacen
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Locacion { get; set; }
        // Relación con ProductoAlmacen
        [JsonIgnore]
        public List<ProductoAlmacen> ProductosAlmacenes { get; set; } = new List<ProductoAlmacen>();

    }

}
