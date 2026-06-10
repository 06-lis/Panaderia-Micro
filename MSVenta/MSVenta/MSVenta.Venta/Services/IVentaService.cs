using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public interface IVentaService
    {
        Task<IEnumerable<Models.Venta>> GetAllVentas();
        Task<Models.Venta> GetVenta(int id);
        Task CreateVenta(Models.Venta venta);
        Task UpdateVenta(Models.Venta venta);
        Task DeleteVenta(int id);
    }
}
