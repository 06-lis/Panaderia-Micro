using System.Collections.Generic;

namespace MSVenta.Produccion.DTOs
{
    public class CreateRecetaDto
    {
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public int ProductoId { get; set; }
        public int CantidadRequerida { get; set; }
        public List<CreateDetalleRecetaDto> Detalles { get; set; } = new List<CreateDetalleRecetaDto>();
    }

    public class CreateDetalleRecetaDto
    {
        public int InsumoId { get; set; }
        public int CantidadRequerida { get; set; }
    }
}
