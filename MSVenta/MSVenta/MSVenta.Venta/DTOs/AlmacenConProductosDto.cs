using System.Collections.Generic;

namespace MSVenta.Venta.DTOs
{
    public class AlmacenConProductosDto
    {
        public int AlmacenId { get; set; }
        public string AlmacenNombre { get; set; }
        public List<ProductoDto> Productos { get; set; }
    }
}
