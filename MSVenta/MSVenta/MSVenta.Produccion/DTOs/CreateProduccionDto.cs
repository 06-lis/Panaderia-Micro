namespace MSVenta.Produccion.DTOs
{
    public class CreateProduccionDto
    {
        public int RecetaId { get; set; }
        public int Lote { get; set; }
        public int EmpleadoSolicitaId { get; set; }
        public string Observaciones { get; set; }
        public System.DateTime? FechaVencimiento { get; set; }
    }

    public class AprobarProduccionDto
    {
        public int EmpleadoAutorizaId { get; set; }
        public int AlmacenOrigenId { get; set; }
        public int AlmacenDestinoId { get; set; }
    }
}
