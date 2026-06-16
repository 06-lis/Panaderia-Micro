namespace MSVenta.Compras.DTOs
{
    public class UpdateStockDto
    {
        public int ItemId { get; set; }
        public int AlmacenId { get; set; }
        public decimal Cantidad { get; set; }
        public decimal CostoUnitario { get; set; }
        public int EmpleadoId { get; set; }
        public System.DateTime? FechaVencimiento { get; set; }
    }
}
