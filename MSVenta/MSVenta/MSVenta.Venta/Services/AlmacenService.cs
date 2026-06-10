using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.DTOs;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public class AlmacenService : IAlmecenService
    {

        private readonly ContextDatabase _context;

        public AlmacenService(ContextDatabase context) => _context = context;

        public async Task CreateAlmacen(Almacen almacen)
        {
            await _context.Almacenes.AddAsync(almacen);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAlmacen(int id)
        {
            var almacen = await _context.Almacenes.FindAsync(id);
            _context.Almacenes.Remove(almacen);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Almacen>> GetAllAlamcenes()
        {
            return await _context.Almacenes.ToListAsync();
        }

        public async Task<List<AlmacenDTO>> GetAllAlmacenesAsync()
        {
            return await _context.Almacenes
                .Include(a => a.ProductosAlmacenes)  // Cargar la relación con ProductoAlmacen
                .ThenInclude(pa => pa.Item)  // Cargar los productos dentro de ProductoAlmacen
                .Select(a => new AlmacenDTO
                {
                    Id = a.Id,
                    Nombre = a.Nombre,
                    Locacion = a.Locacion,
                    Productos = a.ProductosAlmacenes.Select(pa => new ProductoAlmacenDTO
                    {
                        ProductoId = pa.Item.Id,
                        NombreProducto = pa.Item.Nombre,
                        Precio = pa.Item.Precio,  // Incluye el precio si lo necesitas
                        Stock = pa.Stock
                    }).ToList()
                }).ToListAsync();
        }

        public async Task<AlmacenDTO> GetAlmacenByIdAsync(int idAlmacen)
        {
            var almacen = await _context.Almacenes
                .Include(a => a.ProductosAlmacenes)  // Cargar la relación con ProductoAlmacen
                .ThenInclude(pa => pa.Item)  // Cargar los productos dentro de ProductoAlmacen
                .FirstOrDefaultAsync(a => a.Id == idAlmacen); // Buscar por Id

            // Validación si no se encuentra el almacén
            if (almacen == null)
            {
                throw new KeyNotFoundException($"No se encontró un almacén con el ID {idAlmacen}.");
            }

            // Mapear el resultado a DTO
            return new AlmacenDTO
            {
                Id = almacen.Id,
                Nombre = almacen.Nombre,
                Locacion = almacen.Locacion,
                Productos = almacen.ProductosAlmacenes.Select(pa => new ProductoAlmacenDTO
                {
                    ProductoId = pa.Item.Id,
                    NombreProducto = pa.Item.Nombre,
                    Precio = pa.Item.Precio,  // Incluye el precio si lo necesitas
                    Stock = pa.Stock
                }).ToList()
            };
        }

        public async Task<Almacen> GetAlmacen(int id)
        {
            return await _context.Almacenes.FindAsync(id);
        }

        public async Task UpdateAlmacen(Almacen almacen)
        {
            _context.Entry(almacen).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }
    }
}
