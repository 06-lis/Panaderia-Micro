namespace MSVenta.Venta.DTOs
{
    public class ProductoAlmacenDTO
    {
        public int ProductoId { get; set; }
        public string NombreProducto { get; set; }
        public double Precio { get; set; }  // Incluye el precio si lo necesitas

        public int Stock { get; set; }
        public string Tipo { get; set; }
        public string UnidadMedida { get; set; }
    }
}
