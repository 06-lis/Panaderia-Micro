using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Reportes.Services
{
    public interface IVentaProxyService
    {
        Task<IEnumerable<dynamic>> GetVentasAsync();
        Task<IEnumerable<dynamic>> GetDetalleVentasAsync();
        Task<IEnumerable<dynamic>> GetProductoAlmacenesAsync();
    }
    
    public interface ICompraProxyService
    {
        Task<IEnumerable<dynamic>> GetComprasAsync();
    }
    
    public interface IProduccionProxyService
    {
        Task<IEnumerable<dynamic>> GetProduccionesAsync();
    }
    
    public interface IInventarioProxyService
    {
        Task<IEnumerable<dynamic>> GetLotesAsync();
    }
}
