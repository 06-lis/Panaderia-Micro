using System.Text.Json.Serialization;

namespace MSVenta.Produccion.Models
{
    public class DetalleReceta
    {
        public int Id { get; set; }
        public int RecetaId { get; set; }
        [JsonIgnore]
        public Receta Receta { get; set; }
        public int InsumoId { get; set; }
        public int CantidadRequerida { get; set; }
    }
}
