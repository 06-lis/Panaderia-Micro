using System.Collections.Generic;

namespace MSVenta.Venta.DTOs
{
    public class AlmacenDTO
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Locacion { get; set; }
        public string Tipo { get; set; }

        public List<ProductoAlmacenDTO> Productos { get; set; } = new List<ProductoAlmacenDTO>();
    }
}
