using System;
using System.Collections.Generic;

namespace MSVenta.Venta.DTOs
{
    public class PedidoLandingDto
    {
        public string NombreCliente { get; set; }
        public string ApellidoCliente { get; set; }
        public string EmailCliente { get; set; }
        public string CelularCliente { get; set; }
        public List<CarritoItemDto> Items { get; set; }
    }

    public class CarritoItemDto
    {
        public int ProductoAlmacenId { get; set; }
        public string Nombre { get; set; }
        public int Cantidad { get; set; }
        public double Precio { get; set; }
    }

    public class LibelulaResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string QrUrl { get; set; }
        public string UrlPasarela { get; set; }
        public string IdTransaccion { get; set; }
        public string CodigoRecaudacion { get; set; }
    }

    public class WebhookLibelulaDto
    {
        public string transaction_id { get; set; }
        public string identificador { get; set; }
    }
}
