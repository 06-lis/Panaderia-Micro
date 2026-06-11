using System;
using System.Collections.Generic;

namespace MSVenta.Produccion.Models
{
    public class Produccion
    {
        public int Id { get; set; }
        public DateTime? FechaProduccion { get; set; }
        public int CantidadProducida { get; set; }
        public int EmpleadoSolicitaId { get; set; }
        public int? EmpleadoAutorizaId { get; set; }
        public string Estado { get; set; } // pendiente, aprobado, rechazado, cancelado
        public DateTime FechaSolicitud { get; set; }
        public DateTime? FechaAutorizacion { get; set; }
        public string Observaciones { get; set; }

        public ICollection<DetalleProduccion> Detalles { get; set; } = new List<DetalleProduccion>();
    }
}
