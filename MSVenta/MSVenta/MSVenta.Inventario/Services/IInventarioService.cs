using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Inventario.Services
{
    public interface IInventarioService
    {
        Task<bool> IngresoStockAsync(int almacenId, int itemId, decimal cantidad, decimal costoUnitario, int empleadoId, System.DateTime? fechaVencimiento = null, int? referenciaId = null, string referenciaTipo = null);
        Task<bool> ConsumoStockAsync(int almacenId, int itemId, decimal cantidad, int empleadoId, int? referenciaId = null, string referenciaTipo = null);
        
        // Métodos globales con validación cruzada y soporte para PEPS/UEPS global
        Task<List<Models.ConsumoResultado>> ConsumoStockGlobalAsync(int itemId, decimal cantidad, int empleadoId, int? referenciaId = null, string referenciaTipo = null);
        Task<bool> RevertirConsumoGlobalAsync(List<Models.ConsumoResultado> consumosRevertir, int empleadoId, int? referenciaId = null, string referenciaTipo = null);

        Task<IEnumerable<object>> GetLotesAsync();
        Task<IEnumerable<object>> GetMovimientosAsync();
        Task<IEnumerable<object>> GetTraspasosAsync();
        Task<bool> RegistrarTraspasoAsync(int loteId, int almacenOrigenId, int almacenDestinoId, decimal cantidad, string motivo, int empleadoId);
        Task<object> GetConfiguracionAsync();
        Task<bool> UpdateConfiguracionAsync(object config);
    }
}
