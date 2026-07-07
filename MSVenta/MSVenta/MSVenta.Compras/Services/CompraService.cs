using MongoDB.Driver;
using MSVenta.Compras.Models;
using MSVenta.Compras.Repositories;
using MSVenta.Compras.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Compras.Services
{
    public class CompraService : ICompraService
    {
        private readonly MongoContext _context;
        private readonly ISeguridadService _seguridadService;
        private readonly IVentaService _ventaService;

        public CompraService(MongoContext context, ISeguridadService seguridadService, IVentaService ventaService)
        {
            _context = context;
            _seguridadService = seguridadService;
            _ventaService = ventaService;
        }

        public async Task<IEnumerable<NotaCompra>> GetAllAsync()
        {
            return await _context.NotasCompra.Find(_ => true).ToListAsync();
        }

        public async Task<NotaCompra> GetByIdAsync(int id)
        {
            return await _context.NotasCompra.Find(c => c.IdNotaCompra == id).FirstOrDefaultAsync();
        }

        public async Task<NotaCompra> CreateAsync(NotaCompra compra)
        {
            // 1. Validar empleado en microservicio de seguridad
            var empleadoValid = await _seguridadService.ValidateEmpleadoAsync(compra.IdEmpleado);
            if (!empleadoValid)
            {
                throw new ArgumentException($"El Empleado con ID {compra.IdEmpleado} no existe o no es válido en el sistema de seguridad.");
            }

            // 2. Validar proveedor localmente en MongoDB
            var proveedor = await _context.Proveedores.Find(p => p.IdProveedor == compra.IdProveedor).FirstOrDefaultAsync();
            if (proveedor == null)
            {
                throw new ArgumentException($"El Proveedor con ID {compra.IdProveedor} no existe en el sistema.");
            }

            // 3. Generar ID Autoincrementable y metadata de compra
            compra.IdNotaCompra = await _context.GetNextSequenceValueAsync("id_nota_compra");
            compra.FechaCompra = compra.FechaCompra == default ? DateTime.Now : compra.FechaCompra;
            compra.Estado = string.IsNullOrEmpty(compra.Estado) ? "Completada" : compra.Estado;

            // 4. Calcular el monto total
            compra.MontoTotal = compra.Detalles.Sum(d => d.Cantidad * d.Precio);

            // 5. Guardar la compra en MongoDB
            await _context.NotasCompra.InsertOneAsync(compra);

            // 6. Actualizar el stock de cada insumo/item en el microservicio de Ventas
            var updatedDetails = new List<DetalleCompra>();
            try
            {
                foreach (var detalle in compra.Detalles)
                {
                    var updateStockDto = new UpdateStockDto
                    {
                        ItemId = detalle.IdItem,
                        AlmacenId = detalle.IdAlmacen,
                        Cantidad = detalle.Cantidad,
                        CostoUnitario = detalle.Precio,
                        EmpleadoId = compra.IdEmpleado,
                        FechaVencimiento = detalle.FechaVencimiento,
                        ReferenciaId = compra.IdNotaCompra,
                        ReferenciaTipo = "Compra"
                    };

                    await _ventaService.UpdateStockAsync(updateStockDto);
                    updatedDetails.Add(detalle);
                }
            }
            catch (Exception ex)
            {
                // Compensar (revertir) los stocks incrementados
                foreach (var updated in updatedDetails)
                {
                    try
                    {
                        var rollbackDto = new UpdateStockDto
                        {
                            ItemId = updated.IdItem,
                            AlmacenId = updated.IdAlmacen,
                            Cantidad = -updated.Cantidad, // Restar lo sumado
                            CostoUnitario = updated.Precio,
                            EmpleadoId = compra.IdEmpleado,
                            FechaVencimiento = updated.FechaVencimiento,
                            ReferenciaId = compra.IdNotaCompra,
                            ReferenciaTipo = "Compra Rollback"
                        };
                        await _ventaService.UpdateStockAsync(rollbackDto);
                    }
                    catch (Exception rollEx)
                    {
                        Console.WriteLine($"[CRITICAL] Falló la compensación de stock para Item {updated.IdItem} en Almacén {updated.IdAlmacen}: {rollEx.Message}");
                    }
                }

                // Eliminar de MongoDB la Nota de Compra
                await _context.NotasCompra.DeleteOneAsync(c => c.IdNotaCompra == compra.IdNotaCompra);
                throw new Exception($"Fallo al procesar la compra: {ex.Message}");
            }

            return compra;
        }
    }
}
