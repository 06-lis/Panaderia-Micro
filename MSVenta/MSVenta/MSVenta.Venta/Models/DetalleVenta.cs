namespace MSVenta.Venta.Models
{
    public class DetalleVenta
    {
        public int Id { get; set; }
        public int ProductoAlmacenId { get; set; }
        public ProductoAlmacen ProductoAlmacen { get; set; }
        public int VentaId { get; set; }
        public Venta Venta { get; set; }
        public int Cantidad { get; set; }
        public double Monto { get; set; }
    }
}
