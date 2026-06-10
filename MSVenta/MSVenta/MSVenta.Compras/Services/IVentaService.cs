using System.Threading.Tasks;
using MSVenta.Compras.DTOs;

namespace MSVenta.Compras.Services
{
    public interface IVentaService
    {
        Task<bool> UpdateStockAsync(UpdateStockDto dto);
    }
}
