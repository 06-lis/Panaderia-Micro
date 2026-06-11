using MSVenta.Produccion.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Produccion.Services
{
    public interface IProduccionService
    {
        Task<IEnumerable<Models.Produccion>> GetAllAsync();
        Task<Models.Produccion> GetByIdAsync(int id);
        Task<Models.Produccion> SolicitarProduccionAsync(CreateProduccionDto dto);
        Task<Models.Produccion> AprobarProduccionAsync(int id, AprobarProduccionDto dto);
        Task<bool> RechazarProduccionAsync(int id);
    }
}
