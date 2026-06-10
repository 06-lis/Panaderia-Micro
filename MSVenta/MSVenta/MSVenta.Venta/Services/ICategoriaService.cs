using MSVenta.Venta.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public interface ICategoriaService
    {
        Task<List<Categoria>> GetCategoriasAsync();
        public Task<Categoria> GetCategoriaByIdAsync(int id);
        public Task<Categoria> AddCategoriaAsync(Categoria categoria);

        public Task<bool> UpdateCategoriaAsync(Categoria categoria);
        public Task<bool> DeleteCategoriaAsync(int id);




    }
}
