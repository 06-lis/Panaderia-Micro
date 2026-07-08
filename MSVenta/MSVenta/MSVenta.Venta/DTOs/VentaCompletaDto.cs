using System;
using System.Collections.Generic;

namespace MSVenta.Venta.DTOs
{
    public class VentaItemDto
    {
        public int ItemId { get; set; }
        public decimal Cantidad { get; set; }
        public double Monto { get; set; }
    }

    public class VentaCompletaDto
    {
        public int ClienteId { get; set; }
        public int UsuarioId { get; set; }
        public List<VentaItemDto> Items { get; set; }
    }
}
