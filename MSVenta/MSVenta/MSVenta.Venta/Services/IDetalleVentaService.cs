using MSVenta.Venta.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public interface IDetalleVentaService
    {
        Task<IEnumerable<DetalleVenta>> GetAllDetalles();
        Task<DetalleVenta> GetDetalle(int id);
        Task CreateDetalle(DetalleVenta detalle);
        Task UpdateDetalle(DetalleVenta detalle);
        Task DeleteDetalle(int id);

        Task<List<DetalleVenta>> GetDetallesPorVenta(int ventaId);
    }
}
