using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using Org.BouncyCastle.Crypto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public class VentaService : IVentaService
    {
        private readonly ContextDatabase _context;
        private readonly IInventarioService _inventarioService;

        public VentaService(ContextDatabase context, IInventarioService inventarioService)
        {
            _context = context;
            _inventarioService = inventarioService;
        }

        public async Task<IEnumerable<Models.Venta>> GetAllVentas()
        {
            return await _context.Ventas
                .Include(v => v.Cliente)
                .Include(v => v.TransaccionLibelula)
                .OrderBy(v => v.Id)
                .ToListAsync();
        }

        public async Task<Models.Venta> GetVenta(int id)
        {
            return await _context.Ventas
                .Include(v => v.Cliente)
                .Include(v => v.TransaccionLibelula)
                .FirstOrDefaultAsync(v => v.Id == id);
        }

        public async Task CreateVenta(Models.Venta venta)
        {
            // Verificar si el Cliente y Usuario existen
            var cliente = await _context.Clientes.FindAsync(venta.ClienteId);
            if (cliente == null)
            {
                throw new ArgumentException("Cliente o Usuario no existen.");
            }
            // Asignar las entidades relacionadas
            venta.Cliente = cliente;
            await _context.Ventas.AddAsync(venta);
            await _context.SaveChangesAsync();
        }

        public async Task<Models.Venta> CreateVentaCompleta(DTOs.VentaCompletaDto dto)
        {
            var cliente = await _context.Clientes.FindAsync(dto.ClienteId);
            if (cliente == null)
            {
                throw new ArgumentException("Cliente no existe.");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Crear cabecera Venta
                var venta = new Models.Venta
                {
                    Fecha = DateTime.UtcNow,
                    ClienteId = dto.ClienteId,
                    UsuarioId = dto.UsuarioId
                };
                
                await _context.Ventas.AddAsync(venta);
                await _context.SaveChangesAsync();

                var consumosGlobalesRevertir = new List<Models.ConsumoResultado>();

                // 2. Por cada item, hacer consumo global en Inventario
                foreach (var item in dto.Items)
                {
                    var consumos = await _inventarioService.ConsumirStockGlobalAsync(item.ItemId, item.Cantidad, dto.UsuarioId, venta.Id, "Venta");
                    if (consumos == null || !consumos.Any())
                    {
                        // Si falla, revertimos lo que hayamos consumido globalmente hasta el momento
                        if (consumosGlobalesRevertir.Any())
                        {
                            await _inventarioService.RevertirConsumoGlobalAsync(consumosGlobalesRevertir, dto.UsuarioId, venta.Id, "Venta");
                        }
                        throw new Exception($"No hay stock suficiente para el item {item.ItemId}.");
                    }
                    consumosGlobalesRevertir.AddRange(consumos);

                    // 3. Crear detalles de venta por cada almacén consumido
                    foreach (var consumo in consumos)
                    {
                        // Buscar el ProductoAlmacenId correspondiente en la BD de Venta
                        var pa = await _context.ProductosAlmacenes.FirstOrDefaultAsync(p => p.ItemId == consumo.ItemId && p.AlmacenId == consumo.AlmacenId);
                        if (pa == null)
                        {
                            await _inventarioService.RevertirConsumoGlobalAsync(consumosGlobalesRevertir, dto.UsuarioId, venta.Id, "Venta");
                            throw new Exception($"El producto {consumo.ItemId} en el almacén {consumo.AlmacenId} no está registrado en ventas.");
                        }

                        // Calcular el monto proporcional
                        double precioUnitario = item.Monto / (double)item.Cantidad;
                        double montoProporcional = precioUnitario * (double)consumo.CantidadConsumida;

                        var detalle = new Models.DetalleVenta
                        {
                            VentaId = venta.Id,
                            ProductoAlmacenId = pa.Id,
                            Cantidad = (int)consumo.CantidadConsumida,
                            Monto = montoProporcional
                        };
                        await _context.DetallesVenta.AddAsync(detalle);
                        
                        // Actualizar stock localmente (ya que el Inventario no llama a VentaProxy de manera asíncrona para ventas locales si ya lo hicimos aquí)
                        // Espera, InventarioService (Backend) llama a SincronizarStockAgregadoAsync. 
                        // Así que el inventario YA actualizó el stock. No lo descontamos doble.
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return venta;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task UpdateVenta(Models.Venta venta)
        {
            _context.Entry(venta).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteVenta(int id)
        {
            var venta = await _context.Ventas.FindAsync(id);
            if (venta != null)
            {
                // Eliminar manualmente los detalles asociados para evitar la violación de clave foránea
                var detalles = await _context.DetallesVenta.Where(d => d.VentaId == id).ToListAsync();
                _context.DetallesVenta.RemoveRange(detalles);

                _context.Ventas.Remove(venta);
                await _context.SaveChangesAsync();
            }
        }

        public async Task CompletarPagoLibelula(int ventaId, int? usuarioId = null)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var transaccion = await _context.TransaccionesLibelula
                    .Include(t => t.Venta)
                    .ThenInclude(v => v.DetallesVenta)
                    .ThenInclude(d => d.ProductoAlmacen)
                    .FirstOrDefaultAsync(t => t.VentaId == ventaId);

                if (transaccion == null)
                {
                    throw new ArgumentException("La venta no tiene una transacción de Libélula pendiente.");
                }

                if (transaccion.Estado == "completado")
                {
                    return; // Ya fue completado
                }

                var venta = transaccion.Venta;
                int idUsuarioVenta = usuarioId ?? venta.UsuarioId;

                // Agrupar los detalles originales (placeholder) por ItemId
                var itemsAgrupados = venta.DetallesVenta
                    .GroupBy(d => d.ProductoAlmacen.ItemId)
                    .Select(g => new
                    {
                        ItemId = g.Key,
                        Cantidad = g.Sum(d => d.Cantidad),
                        MontoTotal = g.Sum(d => d.Monto)
                    })
                    .ToList();

                var todosConsumos = new System.Collections.Generic.List<Models.ConsumoResultado>();

                // Consumir el stock globalmente por ItemId
                foreach(var grupo in itemsAgrupados)
                {
                    var consumosGlobales = await _inventarioService.ConsumirStockGlobalAsync(grupo.ItemId, (decimal)grupo.Cantidad, idUsuarioVenta, venta.Id, "Venta");
                    if (consumosGlobales == null)
                    {
                        // Falló, revertimos los anteriores
                        if (todosConsumos.Count > 0)
                        {
                            await _inventarioService.RevertirConsumoGlobalAsync(todosConsumos, idUsuarioVenta, venta.Id, "Venta");
                        }
                        throw new Exception($"stock_insuficiente: No hay stock suficiente globalmente.");
                    }
                    todosConsumos.AddRange(consumosGlobales);
                }

                // Borrar los detalles placeholders viejos
                _context.DetallesVenta.RemoveRange(venta.DetallesVenta);
                await _context.SaveChangesAsync();

                // Crear los nuevos detalles con los almacenes reales deducidos
                foreach (var grupo in itemsAgrupados)
                {
                    var consumosItem = todosConsumos.Where(r => r.ItemId == grupo.ItemId).ToList();
                    
                    foreach (var consumo in consumosItem)
                    {
                        var pa = await _context.ProductosAlmacenes.FirstOrDefaultAsync(p => p.ItemId == consumo.ItemId && p.AlmacenId == consumo.AlmacenId);
                        if (pa == null)
                        {
                            throw new Exception($"El producto {consumo.ItemId} en el almacén {consumo.AlmacenId} no está registrado en ventas.");
                        }

                        double precioUnitario = grupo.MontoTotal / (double)grupo.Cantidad;
                        double montoProporcional = precioUnitario * (double)consumo.CantidadConsumida;

                        var detalle = new Models.DetalleVenta
                        {
                            VentaId = venta.Id,
                            ProductoAlmacenId = pa.Id,
                            Cantidad = (int)consumo.CantidadConsumida,
                            Monto = montoProporcional
                        };
                        await _context.DetallesVenta.AddAsync(detalle);
                    }
                }

                transaccion.Estado = "completado";
                _context.TransaccionesLibelula.Update(transaccion);
                
                if (usuarioId.HasValue && transaccion.Venta != null)
                {
                    transaccion.Venta.UsuarioId = usuarioId.Value;
                    _context.Ventas.Update(transaccion.Venta);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
