using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MSVenta.Inventario.Data;
using MSVenta.Inventario.Models;

namespace MSVenta.Inventario.Services
{
    public interface ITraspasoService
    {
        Task<bool> TraspasarStockAsync(int almacenOrigenId, int almacenDestinoId, int itemId, decimal cantidad, int empleadoId);
    }

    public class TraspasoService : ITraspasoService
    {
        private readonly InventarioDbContext _context;
        private readonly IVentaProxyService _ventaProxy;

        public TraspasoService(InventarioDbContext context, IVentaProxyService ventaProxy)
        {
            _context = context;
            _ventaProxy = ventaProxy;
        }

        public async Task<bool> TraspasarStockAsync(int almacenOrigenId, int almacenDestinoId, int itemId, decimal cantidad, int empleadoId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Buscar lotes en el almacén origen con bloqueo
                var lotesOrigen = await _context.LotesInventario
                    .FromSqlRaw("SELECT * FROM lotes_inventario WHERE id_almacen = {0} AND id_item = {1} AND cantidad_disponible > 0 ORDER BY fecha_entrada ASC FOR UPDATE", almacenOrigenId, itemId)
                    .ToListAsync();

                decimal cantidadRestante = cantidad;

                // Crear el registro de traspaso maestro
                var traspaso = new Traspaso
                {
                    IdAlmacenOrigen = almacenOrigenId,
                    IdAlmacenDestino = almacenDestinoId,
                    IdEmpleado = empleadoId,
                    FechaSolicitud = DateTime.UtcNow,
                    FechaAprobacion = DateTime.UtcNow,
                    Estado = "Aprobado",
                    Observaciones = "Traspaso de almacén"
                };
                _context.Traspasos.Add(traspaso);
                await _context.SaveChangesAsync();

                var traspasoItem = new TraspasoAlmacenItem
                {
                    IdTraspaso = traspaso.IdTraspaso,
                    IdItem = itemId,
                    Cantidad = cantidad
                };
                _context.TraspasosAlmacenItem.Add(traspasoItem);

                foreach (var lote in lotesOrigen)
                {
                    if (cantidadRestante <= 0) break;

                    decimal cantidadATraspasar = Math.Min(cantidadRestante, lote.CantidadDisponible);
                    lote.CantidadDisponible -= cantidadATraspasar;
                    cantidadRestante -= cantidadATraspasar;

                    if (lote.CantidadDisponible == 0)
                    {
                        lote.Estado = "Agotado";
                        lote.FechaSalida = DateTime.UtcNow;
                    }
                    _context.LotesInventario.Update(lote);

                    // Movimiento de egreso (Traspaso Salida)
                    var movSalida = new MovimientoInventario
                    {
                        IdLote = lote.IdLote,
                        IdAlmacen = almacenOrigenId,
                        IdItem = itemId,
                        TipoMovimiento = "Traspaso Salida",
                        Cantidad = -cantidadATraspasar,
                        CostoUnitario = lote.PrecioUnitario,
                        CostoTotal = -cantidadATraspasar * lote.PrecioUnitario,
                        FechaMovimiento = DateTime.UtcNow,
                        IdEmpleado = empleadoId,
                        ReferenciaId = traspaso.IdTraspaso,
                        ReferenciaTipo = "Traspaso"
                    };
                    _context.MovimientosInventario.Add(movSalida);

                    // Crear el lote en el almacén destino copiando fechas
                    var loteDestino = new LoteInventario
                    {
                        IdAlmacen = almacenDestinoId,
                        IdItem = itemId,
                        CantidadInicial = cantidadATraspasar,
                        CantidadDisponible = cantidadATraspasar,
                        PrecioUnitario = lote.PrecioUnitario,
                        FechaEntrada = lote.FechaEntrada, // Copiar fecha de creación original
                        FechaVencimiento = lote.FechaVencimiento, // Copiar fecha de vencimiento original
                        MetodoValuacion = lote.MetodoValuacion,
                        Estado = "Disponible",
                        ReferenciaId = traspaso.IdTraspaso,
                        ReferenciaTipo = "Traspaso"
                    };
                    _context.LotesInventario.Add(loteDestino);
                    await _context.SaveChangesAsync(); // Guardar para obtener IdLote

                    // Movimiento de ingreso (Traspaso Entrada)
                    var movEntrada = new MovimientoInventario
                    {
                        IdLote = loteDestino.IdLote,
                        IdAlmacen = almacenDestinoId,
                        IdItem = itemId,
                        TipoMovimiento = "Traspaso Entrada",
                        Cantidad = cantidadATraspasar,
                        CostoUnitario = loteDestino.PrecioUnitario,
                        CostoTotal = cantidadATraspasar * loteDestino.PrecioUnitario,
                        FechaMovimiento = DateTime.UtcNow,
                        IdEmpleado = empleadoId,
                        ReferenciaId = traspaso.IdTraspaso,
                        ReferenciaTipo = "Traspaso"
                    };
                    _context.MovimientosInventario.Add(movEntrada);
                }

                if (cantidadRestante > 0)
                {
                    // No hay suficiente stock en el origen
                    await transaction.RollbackAsync();
                    return false;
                }

                await _context.SaveChangesAsync();

                // Sincronizar stock agregado en MSVenta.Venta (origen: restar, destino: sumar)
                var syncOrigen = await _ventaProxy.SincronizarStockAgregadoAsync(itemId, almacenOrigenId, -cantidad);
                var syncDestino = await _ventaProxy.SincronizarStockAgregadoAsync(itemId, almacenDestinoId, cantidad);

                if (!syncOrigen || !syncDestino)
                {
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
    }
}
