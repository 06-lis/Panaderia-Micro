using MSVenta.Produccion.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Produccion.Services
{
    public interface IRecetaService
    {
        Task<IEnumerable<Receta>> GetAllAsync();
        Task<Receta> GetByIdAsync(int id);
        Task<Receta> CreateAsync(Receta receta);
        Task<bool> UpdateAsync(Receta receta);
        Task<bool> DeleteAsync(int id);
    }
}
