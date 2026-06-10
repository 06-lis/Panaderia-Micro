namespace MSVenta.Venta.DTOs
{
    public class ProductoDto
    {
        public int ItemId { get; set; }
        public string Nombre { get; set; }
        public decimal Precio { get; set; }
        public string Categoria { get; set; }
        public int Stock { get; set; }
    }
}
