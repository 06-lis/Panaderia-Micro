using System.Text.Json.Serialization;

namespace MSVenta.Produccion.Models
{
    public class DetalleProduccion
    {
        public int Id { get; set; }
        public int ProduccionId { get; set; }
        [JsonIgnore]
        public Produccion Produccion { get; set; }
        public int? DetalleRecetaId { get; set; }
        public DetalleReceta DetalleReceta { get; set; }
        public int AlmacenId { get; set; }
        public int ItemId { get; set; }
        public int Cantidad { get; set; }
        public string TipoMovimiento { get; set; } // Ingreso, Egreso
    }
}
