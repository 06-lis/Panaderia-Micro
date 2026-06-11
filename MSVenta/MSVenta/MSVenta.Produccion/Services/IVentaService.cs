using MSVenta.Produccion.DTOs;
using System.Threading.Tasks;

namespace MSVenta.Produccion.Services
{
    public interface IVentaService
    {
        Task<ProductoAlmacenDto> GetStockAsync(int itemId, int almacenId);
        Task<bool> UpdateStockAsync(UpdateStockDto dto);
    }
}
