using MongoDB.Bson.Serialization.Attributes;

namespace MSVenta.Compras.Models
{
    public class DetalleCompra
    {
        [BsonElement("id_almacen")]
        public int IdAlmacen { get; set; }

        [BsonElement("id_item")]
        public int IdItem { get; set; }

        [BsonElement("cantidad")]
        public int Cantidad { get; set; }

        [BsonElement("precio")]
        public decimal Precio { get; set; }
    }
}
