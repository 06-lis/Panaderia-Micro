using Microsoft.EntityFrameworkCore;
using MSVenta.Produccion.DTOs;
using MSVenta.Produccion.Models;
using MSVenta.Produccion.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Produccion.Services
{
    public class ProduccionService : IProduccionService
    {
        private readonly ContextDatabase _context;
        private readonly IVentaService _ventaService;
        private readonly ISeguridadService _seguridadService;

        public ProduccionService(ContextDatabase context, IVentaService ventaService, ISeguridadService seguridadService)
        {
            _context = context;
            _ventaService = ventaService;
            _seguridadService = seguridadService;
        }

        public async Task<IEnumerable<Models.Produccion>> GetAllAsync()
        {
            return await _context.Producciones
                .Include(p => p.Detalles)
                .OrderByDescending(p => p.FechaSolicitud)
                .ToListAsync();
        }

        public async Task<Models.Produccion> GetByIdAsync(int id)
        {
            return await _context.Producciones
                .Include(p => p.Detalles)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Models.Produccion> SolicitarProduccionAsync(CreateProduccionDto dto)
        {
            // 1. Validar existencia del Empleado Solicitante
            var empleadoValido = await _seguridadService.ValidateEmpleadoAsync(dto.EmpleadoSolicitaId);
            if (!empleadoValido)
            {
                throw new ArgumentException($"El Empleado con ID {dto.EmpleadoSolicitaId} no es válido o no está registrado.");
            }

            // 2. Obtener Receta
            var receta = await _context.Recetas
                .Include(r => r.Detalles)
                .FirstOrDefaultAsync(r => r.Id == dto.RecetaId);

            if (receta == null)
            {
                throw new KeyNotFoundException($"No se encontró la Receta con ID {dto.RecetaId}.");
            }

            if (dto.Lote <= 0)
            {
                throw new ArgumentException("El número de lotes debe ser mayor a cero.");
            }

            // 3. Crear cabecera de Producción
            var produccion = new Models.Produccion
            {
                Estado = "pendiente",
                FechaSolicitud = DateTime.Now,
                EmpleadoSolicitaId = dto.EmpleadoSolicitaId,
                Observaciones = dto.Observaciones,
                CantidadProducida = dto.Lote * receta.CantidadRequerida
            };

            // 4. Crear Detalles de Producción (Ingresos / Egresos)
            // Ingreso del Producto Producido
            var detalleIngreso = new DetalleProduccion
            {
                ItemId = receta.ProductoId,
                AlmacenId = dto.AlmacenId,
                Cantidad = dto.Lote * receta.CantidadRequerida,
                TipoMovimiento = "Ingreso"
            };
            produccion.Detalles.Add(detalleIngreso);

            // Egreso de los Insumos Requeridos
            foreach (var detReceta in receta.Detalles)
            {
                var detalleEgreso = new DetalleProduccion
                {
                    ItemId = detReceta.InsumoId,
                    DetalleRecetaId = detReceta.Id,
                    AlmacenId = dto.AlmacenId,
                    Cantidad = dto.Lote * detReceta.CantidadRequerida,
                    TipoMovimiento = "Egreso"
                };
                produccion.Detalles.Add(detalleEgreso);
            }

            await _context.Producciones.AddAsync(produccion);
            await _context.SaveChangesAsync();

            return produccion;
        }

        public async Task<Models.Produccion> AprobarProduccionAsync(int id, AprobarProduccionDto dto)
        {
            // 1. Validar existencia del Empleado Autorizador
            var empleadoValido = await _seguridadService.ValidateEmpleadoAsync(dto.EmpleadoAutorizaId);
            if (!empleadoValido)
            {
                throw new ArgumentException($"El Empleado con ID {dto.EmpleadoAutorizaId} no es válido o no está registrado.");
            }

            // 2. Obtener la solicitud de Producción
            var produccion = await _context.Producciones
                .Include(p => p.Detalles)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (produccion == null)
            {
                throw new KeyNotFoundException($"No se encontró el registro de Producción con ID {id}.");
            }

            if (produccion.Estado != "pendiente")
            {
                throw new InvalidOperationException($"La producción con ID {id} no se puede aprobar porque está en estado '{produccion.Estado}'.");
            }

            // 3. VERIFICACIÓN DE STOCK DE INSUMOS
            var detallesEgreso = produccion.Detalles.Where(d => d.TipoMovimiento == "Egreso").ToList();
            var erroresStock = new List<string>();

            foreach (var egreso in detallesEgreso)
            {
                var stockActual = await _ventaService.GetStockAsync(egreso.ItemId, egreso.AlmacenId);
                if (stockActual == null || stockActual.Stock < egreso.Cantidad)
                {
                    int disponible = stockActual?.Stock ?? 0;
                    erroresStock.Add($"Insumo ID {egreso.ItemId} en Almacén {egreso.AlmacenId}: Requerido {egreso.Cantidad}, Disponible {disponible}.");
                }
            }

            if (erroresStock.Any())
            {
                throw new InvalidOperationException("No se puede aprobar la producción debido a stock insuficiente de insumos:\n" + string.Join("\n", erroresStock));
            }

            // 4. EJECTUAR INCREMENTOS Y DECREMENTOS DE STOCK
            // Decrementar Insumos (Egresos)
            foreach (var egreso in detallesEgreso)
            {
                var ok = await _ventaService.UpdateStockAsync(new UpdateStockDto
                {
                    ItemId = egreso.ItemId,
                    AlmacenId = egreso.AlmacenId,
                    Cantidad = -egreso.Cantidad
                });

                if (!ok)
                {
                    throw new Exception($"Fallo de integración al reducir el stock del insumo ID {egreso.ItemId} en el Almacén {egreso.AlmacenId}.");
                }
            }

            // Incrementar Producto Producido (Ingreso)
            var detalleIngreso = produccion.Detalles.FirstOrDefault(d => d.TipoMovimiento == "Ingreso");
            if (detalleIngreso != null)
            {
                var ok = await _ventaService.UpdateStockAsync(new UpdateStockDto
                {
                    ItemId = detalleIngreso.ItemId,
                    AlmacenId = detalleIngreso.AlmacenId,
                    Cantidad = detalleIngreso.Cantidad
                });

                if (!ok)
                {
                    throw new Exception($"Fallo de integración al aumentar el stock del producto ID {detalleIngreso.ItemId} en el Almacén {detalleIngreso.AlmacenId}.");
                }
            }

            // 5. Guardar estado aprobado en DB
            produccion.Estado = "aprobado";
            produccion.EmpleadoAutorizaId = dto.EmpleadoAutorizaId;
            produccion.FechaAutorizacion = DateTime.Now;
            produccion.FechaProduccion = DateTime.Now;

            _context.Producciones.Update(produccion);
            await _context.SaveChangesAsync();

            return produccion;
        }

        public async Task<bool> RechazarProduccionAsync(int id)
        {
            var produccion = await _context.Producciones.FindAsync(id);
            if (produccion == null) return false;

            if (produccion.Estado != "pendiente")
            {
                throw new InvalidOperationException($"La producción con ID {id} está en estado '{produccion.Estado}' y no se puede rechazar.");
            }

            produccion.Estado = "rechazado";
            _context.Producciones.Update(produccion);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
