namespace MSVenta.Produccion.DTOs
{
    public class UpdateStockDto
    {
        public int ItemId { get; set; }
        public int AlmacenId { get; set; }
        public int Cantidad { get; set; }
    }

    public class ProductoAlmacenDto
    {
        public int Id { get; set; }
        public int ItemId { get; set; }
        public int AlmacenId { get; set; }
        public int Stock { get; set; }
    }
}
