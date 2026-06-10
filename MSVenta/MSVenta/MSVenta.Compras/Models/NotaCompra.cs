using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace MSVenta.Compras.Models
{
    public class NotaCompra
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("id_nota_compra")]
        public int IdNotaCompra { get; set; }

        [BsonElement("fecha_compra")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Local)]
        public DateTime FechaCompra { get; set; }

        [BsonElement("monto_total")]
        public decimal MontoTotal { get; set; }

        [BsonElement("estado")]
        public string Estado { get; set; }

        [BsonElement("id_empleado")]
        public int IdEmpleado { get; set; }

        [BsonElement("id_proveedor")]
        public int IdProveedor { get; set; }

        [BsonElement("detalles")]
        public List<DetalleCompra> Detalles { get; set; } = new List<DetalleCompra>();
    }
}
