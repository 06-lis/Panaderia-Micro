using System.Threading.Tasks;

namespace MSVenta.Inventario.Services
{
    public interface IInventarioService
    {
        Task<bool> IngresoStockAsync(int almacenId, int itemId, decimal cantidad, decimal costoUnitario, int empleadoId, System.DateTime? fechaVencimiento = null);
        Task<bool> ConsumoStockAsync(int almacenId, int itemId, decimal cantidad, int empleadoId);
        
        Task<System.Collections.Generic.IEnumerable<object>> GetLotesAsync();
        Task<System.Collections.Generic.IEnumerable<object>> GetMovimientosAsync();
        Task<System.Collections.Generic.IEnumerable<object>> GetTraspasosAsync();
        Task<bool> RegistrarTraspasoAsync(int loteId, int almacenOrigenId, int almacenDestinoId, decimal cantidad, string motivo, int empleadoId);
        Task<object> GetConfiguracionAsync();
        Task<bool> UpdateConfiguracionAsync(object config);
    }
}
