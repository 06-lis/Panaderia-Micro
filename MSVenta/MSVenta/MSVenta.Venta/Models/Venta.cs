using System;

namespace MSVenta.Venta.Models
{
    public class Venta
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; }
        public int ClienteId { get; set; }
        public Cliente Cliente { get; set; }
        public int UsuarioId { get; set; }
        public virtual TransaccionLibelula TransaccionLibelula { get; set; }
        public virtual System.Collections.Generic.ICollection<DetalleVenta> DetallesVenta { get; set; }
    }
}
