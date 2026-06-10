namespace MSVenta.Venta.DTOs
{
    public class ProductoAlmacenDTO
    {
        public int ProductoId { get; set; }
        public string NombreProducto { get; set; }
        public double Precio { get; set; }  // Incluye el precio si lo necesitas

        public int Stock { get; set; }
    }
}
