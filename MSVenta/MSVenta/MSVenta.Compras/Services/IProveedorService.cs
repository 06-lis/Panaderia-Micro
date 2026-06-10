using System.Collections.Generic;
using System.Threading.Tasks;
using MSVenta.Compras.Models;

namespace MSVenta.Compras.Services
{
    public interface IProveedorService
    {
        Task<IEnumerable<Proveedor>> GetAllAsync();
        Task<Proveedor> GetByIdAsync(int id);
        Task<Proveedor> CreateAsync(Proveedor proveedor);
        Task<bool> UpdateAsync(int id, Proveedor proveedor);
        Task<bool> DeleteAsync(int id);
    }
}
