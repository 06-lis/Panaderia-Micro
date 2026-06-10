using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public class ProductoService : IProductoService
    {
        private readonly ContextDatabase _context;

        public ProductoService(ContextDatabase context) => _context = context;

        public async Task<IEnumerable<Producto>> GetAllProductos()
        {
            return await _context.Productos.Include(p => p.Categoria).ToListAsync();
        }

        public async Task<Producto> GetProducto(int id)
        {
            var producto = await _context.Productos
                .Include(p => p.Categoria)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (producto == null)
                throw new KeyNotFoundException("Producto no encontrado.");

            return producto;
        }

        public async Task CreateProducto(Producto producto)
        {
            if (producto == null)
                throw new ArgumentNullException(nameof(producto), "El producto no puede ser nulo.");

            if (string.IsNullOrEmpty(producto.Nombre) || producto.Precio <= 0)
                throw new ArgumentException("El producto debe tener un nombre y un precio válido.");

            var existe = await _context.Productos.AnyAsync(p => p.Nombre == producto.Nombre);
            if (existe)
                throw new InvalidOperationException("El producto ya existe.");

            await _context.Productos.AddAsync(producto);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateProducto(Producto producto)
        {
            if (producto == null)
                throw new ArgumentNullException(nameof(producto), "El producto no puede ser nulo.");

            var productoExistente = await _context.Productos.FindAsync(producto.Id);
            if (productoExistente == null)
                throw new KeyNotFoundException("No se puede actualizar porque el producto no existe.");

            _context.Entry(producto).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteProducto(int id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null)
                throw new KeyNotFoundException("No se puede eliminar porque el producto no existe.");

            // Validar que no haya registros en producto_almacen
            var tieneRelacion = await _context.ProductosAlmacenes.AnyAsync(pa => pa.ItemId == id);            
            if (tieneRelacion)
                throw new InvalidOperationException("No se puede eliminar el producto porque está relacionado con almacen.");

            _context.Productos.Remove(producto);
            await _context.SaveChangesAsync();
        }
    }
}
