namespace MSVenta.Compras.DTOs
{
    public class UpdateStockDto
    {
        public int ItemId { get; set; }
        public int AlmacenId { get; set; }
        public int Cantidad { get; set; }
    }
}
