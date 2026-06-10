using MSVenta.Venta.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public interface IItemService
    {
        Task<IEnumerable<Item>> GetAll();
        Task<Item> GetById(int id);
        Task CreateProducto(Producto producto);
        Task CreateInsumo(Insumo insumo);
        Task UpdateItem(Item item);
        Task DeleteItem(int id);
    }
}