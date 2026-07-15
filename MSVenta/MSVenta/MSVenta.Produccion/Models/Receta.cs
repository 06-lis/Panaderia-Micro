using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
namespace MSVenta.Produccion.Models
{
    public class Receta
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public int ProductoId { get; set; }
        public int CantidadRequerida { get; set; }
        [Column("fecha_aprobacion")]
        [JsonPropertyName("fecha_aprobacion")]
        public DateTime? FechaAprobacion { get; set; }

        public ICollection<DetalleReceta> Detalles { get; set; } = new List<DetalleReceta>();
    }
}
