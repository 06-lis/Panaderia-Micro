using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using MSVenta.Venta.Repositories;
using System.Linq;

namespace MSVenta.Venta.Services
{
    public class DetalleVentaService : IDetalleVentaService
    {
        private readonly ContextDatabase _context;
        private readonly IInventarioService _inventarioService;

        public DetalleVentaService(ContextDatabase context, IInventarioService inventarioService)
        {
            _context = context;
            _inventarioService = inventarioService;
        }

        public async Task<IEnumerable<DetalleVenta>> GetAllDetalles()
            => await _context.DetallesVenta
                .Include(dv => dv.Venta)
                .Include(dv => dv.ProductoAlmacen)
                .ToListAsync();

        public async Task<DetalleVenta> GetDetalle(int id)
        {
            return await _context.DetallesVenta
                  .Include(dv => dv.Venta)
                    .ThenInclude(c => c.Cliente)
                  .Include(dv => dv.ProductoAlmacen)
                    .ThenInclude(p => p.Item)
                        .ThenInclude(c => c.Categoria)
                  .Include(dv => dv.ProductoAlmacen)
                    .ThenInclude(a => a.Almacen)
                  .FirstOrDefaultAsync(dv => dv.Id == id);
        }

        public async Task<List<DetalleVenta>> GetDetallesPorVenta(int ventaId)
        {
            return await _context.DetallesVenta
                  .Where(dv => dv.VentaId == ventaId)
                  .Include(dv => dv.Venta)
                    .ThenInclude(v => v.Cliente)
                  .Include(dv => dv.ProductoAlmacen)
                    .ThenInclude(pa => pa.Item)
                        .ThenInclude(p => p.Categoria)
                  .Include(dv => dv.ProductoAlmacen)
                    .ThenInclude(pa => pa.Almacen)
                  .ToListAsync();
        }


        public async Task CreateDetalle(DetalleVenta detalle)
        {
            // Validar existencia de Venta y ProductoAlmacen
            var venta = await _context.Ventas.FirstOrDefaultAsync(v => v.Id == detalle.VentaId);
            if (venta == null)
                throw new Exception("Venta no existe");

            var productoAlmacen = await _context.ProductosAlmacenes.FirstOrDefaultAsync(pa => pa.Id == detalle.ProductoAlmacenId);
            if (productoAlmacen == null)
                throw new Exception("Producto en almacén no existe");

            await _context.DetallesVenta.AddAsync(detalle);
            await _context.SaveChangesAsync();

            // Consumir el stock de cada detalle en el microservicio Inventario
            bool consumoResult = await _inventarioService.ConsumirStockAsync(productoAlmacen.ItemId, productoAlmacen.AlmacenId, detalle.Cantidad, venta.UsuarioId);
            if (!consumoResult)
            {
                // Si falla el consumo, se podría lanzar una excepción y revertir la transacción.
                // Idealmente envuelto en un transaction local si se puede.
                throw new Exception($"No se pudo consumir el stock para el Item {productoAlmacen.ItemId}.");
            }
        }

        public async Task UpdateDetalle(DetalleVenta detalle)
        {
            _context.Entry(detalle).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteDetalle(int id)
        {
            var detalle = await _context.DetallesVenta.FindAsync(id);
            _context.DetallesVenta.Remove(detalle);
            await _context.SaveChangesAsync();
        }
    }
}

