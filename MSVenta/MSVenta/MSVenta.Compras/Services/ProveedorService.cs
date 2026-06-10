using MongoDB.Driver;
using MSVenta.Compras.Models;
using MSVenta.Compras.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Compras.Services
{
    public class ProveedorService : IProveedorService
    {
        private readonly MongoContext _context;

        public ProveedorService(MongoContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Proveedor>> GetAllAsync()
        {
            return await _context.Proveedores.Find(_ => true).ToListAsync();
        }

        public async Task<Proveedor> GetByIdAsync(int id)
        {
            return await _context.Proveedores.Find(p => p.IdProveedor == id).FirstOrDefaultAsync();
        }

        public async Task<Proveedor> CreateAsync(Proveedor proveedor)
        {
            proveedor.IdProveedor = await _context.GetNextSequenceValueAsync("id_proveedor");
            await _context.Proveedores.InsertOneAsync(proveedor);
            return proveedor;
        }

        public async Task<bool> UpdateAsync(int id, Proveedor proveedor)
        {
            var existing = await GetByIdAsync(id);
            if (existing == null) return false;

            proveedor.Id = existing.Id;
            proveedor.IdProveedor = id;

            var result = await _context.Proveedores.ReplaceOneAsync(p => p.IdProveedor == id, proveedor);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var result = await _context.Proveedores.DeleteOneAsync(p => p.IdProveedor == id);
            return result.DeletedCount > 0;
        }
    }
}
