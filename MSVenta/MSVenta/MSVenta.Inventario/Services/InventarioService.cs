using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MSVenta.Inventario.Data;
using MSVenta.Inventario.Models;

namespace MSVenta.Inventario.Services
{
    public class InventarioService : IInventarioService
    {
        private readonly InventarioDbContext _context;
        private readonly IVentaProxyService _ventaProxy;

        public InventarioService(InventarioDbContext context, IVentaProxyService ventaProxy)
        {
            _context = context;
            _ventaProxy = ventaProxy;
        }

        public async Task<bool> IngresoStockAsync(int almacenId, int itemId, decimal cantidad, decimal costoUnitario, int empleadoId, System.DateTime? fechaVencimiento = null, int? referenciaId = null, string referenciaTipo = null)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var lote = new LoteInventario
                {
                    IdAlmacen = almacenId,
                    IdItem = itemId,
                    CantidadInicial = cantidad,
                    CantidadDisponible = cantidad,
                    PrecioUnitario = costoUnitario,
                    FechaEntrada = DateTime.UtcNow,
                    FechaVencimiento = fechaVencimiento,
                    MetodoValuacion = "PEPS",
                    Estado = "Disponible"
                };

                _context.LotesInventario.Add(lote);
                await _context.SaveChangesAsync();

                var movimiento = new MovimientoInventario
                {
                    IdLote = lote.IdLote,
                    IdAlmacen = almacenId,
                    IdItem = itemId,
                    TipoMovimiento = "Ingreso",
                    Cantidad = cantidad,
                    CostoUnitario = costoUnitario,
                    CostoTotal = cantidad * costoUnitario,
                    FechaMovimiento = DateTime.UtcNow,
                    IdEmpleado = empleadoId,
                    ReferenciaId = referenciaId,
                    ReferenciaTipo = referenciaTipo
                };

                _context.MovimientosInventario.Add(movimiento);
                await _context.SaveChangesAsync();

                var syncResult = await _ventaProxy.SincronizarStockAgregadoAsync(itemId, almacenId, cantidad);
                if (!syncResult) {
                    await transaction.RollbackAsync();
                    return false;
                }

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> ConsumoStockAsync(int almacenId, int itemId, decimal cantidad, int empleadoId, int? referenciaId = null, string referenciaTipo = null)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Buscar lotes disponibles por PEPS con bloqueo FOR UPDATE
                var lotesDisponibles = await _context.LotesInventario
                    .FromSqlRaw("SELECT * FROM lotes_inventario WHERE id_almacen = {0} AND id_item = {1} AND cantidad_disponible > 0 ORDER BY fecha_entrada ASC FOR UPDATE", almacenId, itemId)
                    .ToListAsync();

                decimal cantidadRestante = cantidad;

                foreach (var lote in lotesDisponibles)
                {
                    if (cantidadRestante <= 0) break;

                    decimal cantidadAComsumir = Math.Min(cantidadRestante, lote.CantidadDisponible);
                    lote.CantidadDisponible -= cantidadAComsumir;
                    cantidadRestante -= cantidadAComsumir;

                    if (lote.CantidadDisponible == 0)
                    {
                        lote.Estado = "Agotado";
                        lote.FechaSalida = DateTime.UtcNow;
                    }

                    _context.LotesInventario.Update(lote);

                    var movimiento = new MovimientoInventario
                    {
                        IdLote = lote.IdLote,
                        IdAlmacen = almacenId,
                        IdItem = itemId,
                        TipoMovimiento = "Consumo",
                        Cantidad = -cantidadAComsumir,
                        CostoUnitario = lote.PrecioUnitario,
                        CostoTotal = -cantidadAComsumir * lote.PrecioUnitario,
                        FechaMovimiento = DateTime.UtcNow,
                        IdEmpleado = empleadoId,
                        ReferenciaId = referenciaId,
                        ReferenciaTipo = referenciaTipo
                    };

                    _context.MovimientosInventario.Add(movimiento);
                }

                if (cantidadRestante > 0)
                {
                    // No hay suficiente stock
                    await transaction.RollbackAsync();
                    return false;
                }

                await _context.SaveChangesAsync();
                
                // Consumo requires negative quantity to update-stock endpoint
                var syncResult = await _ventaProxy.SincronizarStockAgregadoAsync(itemId, almacenId, -cantidad);
                if (!syncResult) {
                    await transaction.RollbackAsync();
                    return false;
                }

                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                return false;
            }
        }

        public async Task<System.Collections.Generic.List<ConsumoResultado>> ConsumoStockGlobalAsync(int itemId, decimal cantidad, int empleadoId, int? referenciaId = null, string referenciaTipo = null)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // TODO: Obtener config real si existe. Default: PEPS
                string order = "ASC"; // ASC para PEPS, DESC para UEPS
                
                var lotesDisponibles = await _context.LotesInventario
                    .FromSqlRaw($"SELECT * FROM lotes_inventario WHERE id_item = {{0}} AND cantidad_disponible > 0 ORDER BY fecha_entrada {order} FOR UPDATE", itemId)
                    .ToListAsync();

                decimal cantidadRestante = cantidad;
                var consumos = new System.Collections.Generic.List<ConsumoResultado>();

                foreach (var lote in lotesDisponibles)
                {
                    if (cantidadRestante <= 0) break;

                    decimal cantidadAComsumir = Math.Min(cantidadRestante, lote.CantidadDisponible);
                    lote.CantidadDisponible -= cantidadAComsumir;
                    cantidadRestante -= cantidadAComsumir;

                    if (lote.CantidadDisponible == 0)
                    {
                        lote.Estado = "Agotado";
                        lote.FechaSalida = DateTime.UtcNow;
                    }

                    _context.LotesInventario.Update(lote);

                    var movimiento = new MovimientoInventario
                    {
                        IdLote = lote.IdLote,
                        IdAlmacen = lote.IdAlmacen,
                        IdItem = itemId,
                        TipoMovimiento = "Consumo Global (Venta)",
                        Cantidad = -cantidadAComsumir,
                        CostoUnitario = lote.PrecioUnitario,
                        CostoTotal = -cantidadAComsumir * lote.PrecioUnitario,
                        FechaMovimiento = DateTime.UtcNow,
                        IdEmpleado = empleadoId,
                        ReferenciaId = referenciaId,
                        ReferenciaTipo = referenciaTipo
                    };

                    _context.MovimientosInventario.Add(movimiento);

                    // Registrar en la lista de consumos por almacén
                    var consumoExistente = consumos.FirstOrDefault(c => c.AlmacenId == lote.IdAlmacen);
                    if (consumoExistente != null)
                    {
                        consumoExistente.CantidadConsumida += cantidadAComsumir;
                    }
                    else
                    {
                        consumos.Add(new ConsumoResultado
                        {
                            AlmacenId = lote.IdAlmacen,
                            ItemId = itemId,
                            CantidadConsumida = cantidadAComsumir
                        });
                    }
                }

                if (cantidadRestante > 0)
                {
                    // No hay suficiente stock global
                    await transaction.RollbackAsync();
                    return null;
                }

                await _context.SaveChangesAsync();
                
                // Sincronizar cada consumo con el microservicio de Venta
                foreach (var c in consumos)
                {
                    var syncResult = await _ventaProxy.SincronizarStockAgregadoAsync(c.ItemId, c.AlmacenId, -c.CantidadConsumida);
                    if (!syncResult)
                    {
                        await transaction.RollbackAsync();
                        return null;
                    }
                }

                await transaction.CommitAsync();
                return consumos;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> RevertirConsumoGlobalAsync(System.Collections.Generic.List<ConsumoResultado> consumosRevertir, int empleadoId, int? referenciaId = null, string referenciaTipo = null)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                foreach (var consumo in consumosRevertir)
                {
                    // Creamos un nuevo lote (o sumamos a un existente)
                    // Como es un rollback, podemos simplemente hacer un ingreso (devolución) o buscar el último lote
                    var lote = new LoteInventario
                    {
                        IdAlmacen = consumo.AlmacenId,
                        IdItem = consumo.ItemId,
                        CantidadInicial = consumo.CantidadConsumida,
                        CantidadDisponible = consumo.CantidadConsumida,
                        PrecioUnitario = 0, // o buscar el costo promedio si fuera necesario, para rollback simple puede ser 0
                        FechaEntrada = DateTime.UtcNow,
                        MetodoValuacion = "PEPS",
                        Estado = "Disponible"
                    };

                    _context.LotesInventario.Add(lote);
                    await _context.SaveChangesAsync();

                    var movimiento = new MovimientoInventario
                    {
                        IdLote = lote.IdLote,
                        IdAlmacen = consumo.AlmacenId,
                        IdItem = consumo.ItemId,
                        TipoMovimiento = "Rollback Venta (Devolución)",
                        Cantidad = consumo.CantidadConsumida,
                        CostoUnitario = 0,
                        CostoTotal = 0,
                        FechaMovimiento = DateTime.UtcNow,
                        IdEmpleado = empleadoId,
                        ReferenciaId = referenciaId,
                        ReferenciaTipo = referenciaTipo
                    };

                    _context.MovimientosInventario.Add(movimiento);
                    await _context.SaveChangesAsync();

                    // Sincronizar de vuelta
                    var syncResult = await _ventaProxy.SincronizarStockAgregadoAsync(consumo.ItemId, consumo.AlmacenId, consumo.CantidadConsumida);
                    if (!syncResult)
                    {
                        await transaction.RollbackAsync();
                        return false;
                    }
                }

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return false;
            }
        }


        public async Task<System.Collections.Generic.IEnumerable<object>> GetLotesAsync()
        {
            return await _context.LotesInventario
                .Select(l => new {
                    id_lote = l.IdLote,
                    id_almacen = l.IdAlmacen,
                    almacen_nombre = "Almacen " + l.IdAlmacen, // Basic mock or inner join if you have the model
                    id_item = l.IdItem,
                    item_nombre = "Item " + l.IdItem,
                    cantidad_inicial = l.CantidadInicial,
                    cantidad_disponible = l.CantidadDisponible,
                    precio_unitario = l.PrecioUnitario,
                    fecha_entrada = l.FechaEntrada,
                    fecha_salida = l.FechaSalida,
                    fecha_vencimiento = l.FechaVencimiento,
                    metodo_valuacion = l.MetodoValuacion,
                    estado = l.Estado
                }).ToListAsync();
        }

        public async Task<System.Collections.Generic.IEnumerable<object>> GetMovimientosAsync()
        {
            return await _context.MovimientosInventario
                .OrderByDescending(m => m.FechaMovimiento)
                .Select(m => new {
                    id_movimiento = m.IdMovimiento,
                    lote_id = m.IdLote,
                    tipo_movimiento = m.TipoMovimiento,
                    cantidad = m.Cantidad,
                    costo_total = m.CostoTotal,
                    motivo = "Movimiento Sistema",
                    responsable_nombre = "Emp " + m.IdEmpleado,
                    fecha_movimiento = m.FechaMovimiento,
                    id_item = m.IdItem,
                    referencia_id = m.ReferenciaId,
                    referencia_tipo = m.ReferenciaTipo
                }).ToListAsync();
        }

        public async Task<System.Collections.Generic.IEnumerable<object>> GetTraspasosAsync()
        {
            var traspasos = await _context.Traspasos.ToListAsync();
            var traspasosItems = await _context.TraspasosAlmacenItem.ToListAsync();
            
            var result = new System.Collections.Generic.List<object>();
            foreach (var t in traspasos)
            {
                var item = traspasosItems.FirstOrDefault(i => i.IdTraspaso == t.IdTraspaso);
                result.Add(new {
                    id_traspaso = t.IdTraspaso,
                    fecha_traspaso = t.FechaSolicitud,
                    origen_almacen_id = t.IdAlmacenOrigen,
                    destino_almacen_id = t.IdAlmacenDestino,
                    cantidad = item != null ? item.Cantidad : 0,
                    lote_origen_id = item != null ? item.IdLoteOrigen : null,
                    lote_destino_id = item != null ? item.IdLoteDestino : null,
                    motivo = t.Observaciones,
                    estado = t.Estado,
                    id_item = item != null ? item.IdItem : 0
                });
            }
            return result;
        }

        public async Task<bool> RegistrarTraspasoAsync(int loteId, int almacenOrigenId, int almacenDestinoId, decimal cantidad, string motivo, int empleadoId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var lote = await _context.LotesInventario.FindAsync(loteId);
                if (lote == null || lote.CantidadDisponible < cantidad) return false;

                lote.CantidadDisponible -= cantidad;
                _context.LotesInventario.Update(lote);

                var nuevoLote = new LoteInventario
                {
                    IdAlmacen = almacenDestinoId,
                    IdItem = lote.IdItem,
                    CantidadInicial = cantidad,
                    CantidadDisponible = cantidad,
                    PrecioUnitario = lote.PrecioUnitario,
                    FechaEntrada = DateTime.UtcNow,
                    FechaVencimiento = lote.FechaVencimiento,
                    MetodoValuacion = lote.MetodoValuacion,
                    Estado = "Disponible"
                };
                _context.LotesInventario.Add(nuevoLote);

                var movimientoSalida = new MovimientoInventario
                {
                    IdLote = lote.IdLote,
                    IdAlmacen = almacenOrigenId,
                    IdItem = lote.IdItem,
                    TipoMovimiento = "Salida Traspaso",
                    Cantidad = -cantidad,
                    CostoUnitario = lote.PrecioUnitario,
                    CostoTotal = -cantidad * lote.PrecioUnitario,
                    FechaMovimiento = DateTime.UtcNow,
                    IdEmpleado = empleadoId
                };
                _context.MovimientosInventario.Add(movimientoSalida);

                var traspaso = new MSVenta.Inventario.Models.Traspaso
                {
                    IdAlmacenOrigen = almacenOrigenId,
                    IdAlmacenDestino = almacenDestinoId,
                    IdEmpleado = empleadoId,
                    FechaSolicitud = DateTime.UtcNow,
                    Estado = "Completado",
                    Observaciones = motivo
                };
                _context.Traspasos.Add(traspaso);
                await _context.SaveChangesAsync();

                var traspasoItem = new MSVenta.Inventario.Models.TraspasoAlmacenItem
                {
                    IdTraspaso = traspaso.IdTraspaso,
                    IdItem = lote.IdItem,
                    Cantidad = cantidad,
                    IdLoteOrigen = lote.IdLote,
                    IdLoteDestino = nuevoLote.IdLote
                };
                _context.TraspasosAlmacenItem.Add(traspasoItem);
                
                await _context.SaveChangesAsync();
                
                var syncOrigen = await _ventaProxy.SincronizarStockAgregadoAsync(lote.IdItem, almacenOrigenId, -cantidad);
                var syncDestino = await _ventaProxy.SincronizarStockAgregadoAsync(lote.IdItem, almacenDestinoId, cantidad);

                if (!syncOrigen || !syncDestino)
                {
                    await transaction.RollbackAsync();
                    return false;
                }

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return false;
            }
        }

        public async Task<object> GetConfiguracionAsync()
        {
            return await Task.FromResult(new {
                metodo_valuacion_por_defecto = "FIFO",
                dias_notificacion_vencimiento = 30,
                permitir_stock_negativo = false,
                notificar_stock_bajo = true,
                nivel_stock_bajo = 10,
                dias_por_defecto_vencimiento = 365
            });
        }

        public async Task<bool> UpdateConfiguracionAsync(object config)
        {
            return await Task.FromResult(true);
        }
    }
}
