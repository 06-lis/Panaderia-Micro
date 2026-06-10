using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public class ItemService : IItemService
    {
        private readonly ContextDatabase _context;

        public ItemService(ContextDatabase context) => _context = context;

        public async Task<IEnumerable<Item>> GetAll() =>
            await _context.Items.Include(i => i.Categoria).ToListAsync();

        public async Task<Item> GetById(int id)
        {
            var item = await _context.Items.Include(i => i.Categoria).FirstOrDefaultAsync(i => i.Id == id);
            if (item == null) throw new KeyNotFoundException("Item no encontrado.");
            return item;
        }

        public async Task CreateProducto(Producto producto)
        {
            producto.Tipo = "Producto";
            await _context.Productos.AddAsync(producto);
            await _context.SaveChangesAsync();
        }

        public async Task CreateInsumo(Insumo insumo)
        {
            insumo.Tipo = "Insumo";
            await _context.Insumos.AddAsync(insumo);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateItem(Item item)
        {
            _context.Items.Update(item);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteItem(int id)
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null) throw new KeyNotFoundException("Item no encontrado.");
            _context.Items.Remove(item);
            await _context.SaveChangesAsync();
        }
    }
}