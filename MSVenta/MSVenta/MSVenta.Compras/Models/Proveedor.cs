using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MSVenta.Compras.Models
{
    public class Proveedor
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("id_proveedor")]
        public int IdProveedor { get; set; }

        [BsonElement("tipo_proveedor")]
        public string TipoProveedor { get; set; } // "Persona" o "Empresa"

        [BsonElement("telefono")]
        public string Telefono { get; set; }

        [BsonElement("direccion")]
        public string Direccion { get; set; }

        [BsonElement("correo")]
        public string Correo { get; set; }

        // Atributos de Ppersona
        [BsonElement("nombre")]
        public string Nombre { get; set; }

        // Atributos de Pempresa
        [BsonElement("razon_social")]
        public string RazonSocial { get; set; }
    }
}
