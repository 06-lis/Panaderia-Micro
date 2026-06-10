namespace MSVenta.Venta.Models
{
    public class Item
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public double Precio { get; set; }
        public string Tipo { get; set; }
        public string UnidadMedida { get; set; }
        public int? CategoriaId { get; set; }
        public Categoria Categoria { get; set; }
    }
}
