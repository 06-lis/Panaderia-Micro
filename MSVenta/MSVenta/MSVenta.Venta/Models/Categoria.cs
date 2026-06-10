using System.Collections.Generic;

namespace MSVenta.Venta.Models
{
    public class Categoria
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        //public ICollection<Producto> Productos { get; set; } // Relación uno a muchos
    }
}
