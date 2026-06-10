using System.Collections.Generic;
using System.Threading.Tasks;
using MSVenta.Compras.Models;

namespace MSVenta.Compras.Services
{
    public interface ICompraService
    {
        Task<IEnumerable<NotaCompra>> GetAllAsync();
        Task<NotaCompra> GetByIdAsync(int id);
        Task<NotaCompra> CreateAsync(NotaCompra compra);
    }
}
