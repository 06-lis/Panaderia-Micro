using Microsoft.Extensions.Configuration;
using MongoDB.Bson;
using MongoDB.Driver;
using MSVenta.Compras.Models;
using System.Threading.Tasks;

namespace MSVenta.Compras.Repositories
{
    public class MongoContext
    {
        private readonly IMongoDatabase _database;

        public MongoContext(IMongoDatabase database)
        {
            _database = database;
        }

        public IMongoCollection<Proveedor> Proveedores => 
            _database.GetCollection<Proveedor>("proveedores");

        public IMongoCollection<NotaCompra> NotasCompra => 
            _database.GetCollection<NotaCompra>("notas_compra");

        public async Task<int> GetNextSequenceValueAsync(string sequenceName)
        {
            var collection = _database.GetCollection<BsonDocument>("counters");
            var filter = Builders<BsonDocument>.Filter.Eq("_id", sequenceName);
            var update = Builders<BsonDocument>.Update.Inc("seq", 1);
            var options = new FindOneAndUpdateOptions<BsonDocument>
            {
                IsUpsert = true,
                ReturnDocument = ReturnDocument.After
            };
            var result = await collection.FindOneAndUpdateAsync(filter, update, options);
            return result["seq"].AsInt32;
        }
    }
}
