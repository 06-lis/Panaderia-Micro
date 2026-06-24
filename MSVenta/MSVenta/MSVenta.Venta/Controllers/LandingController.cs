using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.DTOs;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using MSVenta.Venta.Services;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Venta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LandingController : ControllerBase
    {
        private readonly ContextDatabase _context;
        private readonly ILibelulaService _libelulaService;
        private readonly IInventarioService _inventarioService;

        public LandingController(ContextDatabase context, ILibelulaService libelulaService, IInventarioService inventarioService)
        {
            _context = context;
            _libelulaService = libelulaService;
            _inventarioService = inventarioService;
        }

        [HttpGet("productos")]
        public async Task<IActionResult> GetProductos()
        {
            // Solo traer items tipo Producto que tengan stock mayor a 0 en almacenes
            var productos = await _context.ProductosAlmacenes
                .Include(pa => pa.Item)
                .Where(pa => pa.Item.Tipo == "Producto" && pa.Stock > 0)
                .Select(pa => new
                {
                    ProductoAlmacenId = pa.Id,
                    ItemId = pa.ItemId,
                    Nombre = pa.Item.Nombre,
                    Precio = pa.Item.Precio,
                    Stock = pa.Stock,
                    Imagen = ((Producto)pa.Item).Imagen
                })
                .ToListAsync();

            return Ok(productos);
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] PedidoLandingDto pedido)
        {
            if (pedido == null || pedido.Items == null || !pedido.Items.Any())
            {
                return BadRequest("El pedido está vacío.");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Buscar cliente o crearlo (para la BD de la panadería)
                // Nota: Asumimos cliente genérico o el que se mande
                var cliente = await _context.Clientes
                    .FirstOrDefaultAsync(c => c.Nombre == pedido.NombreCliente && c.Apellidos == pedido.ApellidoCliente);
                
                if (cliente == null)
                {
                    cliente = new Cliente
                    {
                        Nombre = string.IsNullOrEmpty(pedido.NombreCliente) ? "Cliente Landing" : pedido.NombreCliente,
                        Apellidos = string.IsNullOrEmpty(pedido.ApellidoCliente) ? "Web" : pedido.ApellidoCliente,
                        Celular = int.TryParse(pedido.CelularCliente, out var cel) ? cel : 0
                    };
                    _context.Clientes.Add(cliente);
                    await _context.SaveChangesAsync();
                }

                // Crear Venta
                var venta = new Models.Venta
                {
                    Fecha = DateTime.UtcNow,
                    ClienteId = cliente.Id,
                    UsuarioId = 1 // Usuario genérico de Landing/Web
                };
                _context.Ventas.Add(venta);
                await _context.SaveChangesAsync();

                // Añadir Detalles y reducir stock
                foreach (var item in pedido.Items)
                {
                    var pa = await _context.ProductosAlmacenes.FindAsync(item.ProductoAlmacenId);
                    if (pa != null && pa.Stock >= item.Cantidad)
                    {
                        pa.Stock -= item.Cantidad;
                        _context.ProductosAlmacenes.Update(pa);

                        var detalle = new DetalleVenta
                        {
                            ProductoAlmacenId = pa.Id,
                            VentaId = venta.Id,
                            Cantidad = item.Cantidad,
                            Monto = item.Precio * item.Cantidad
                        };
                        _context.DetallesVenta.Add(detalle);

                        // Consumir el stock de cada detalle en el microservicio Inventario (manejo de lotes)
                        bool consumoResult = await _inventarioService.ConsumirStockAsync(pa.ItemId, pa.AlmacenId, item.Cantidad, venta.UsuarioId, venta.Id, "Venta");
                        if (!consumoResult)
                        {
                            throw new Exception($"No se pudo consumir el stock para el Item {item.Nombre} en MSInventario.");
                        }
                    }
                    else
                    {
                        throw new Exception($"Stock insuficiente para el producto {item.Nombre}");
                    }
                }
                await _context.SaveChangesAsync();

                // Llamar a Libelula
                var responseLibelula = await _libelulaService.RegistrarPagoAsync(
                    venta, 
                    pedido.Items, 
                    pedido.NombreCliente, 
                    pedido.ApellidoCliente, 
                    pedido.EmailCliente ?? "cliente@panaderiaotto.com");

                if (responseLibelula.Success)
                {
                    await transaction.CommitAsync();
                    return Ok(responseLibelula);
                }
                else
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new { message = "Error con la pasarela de pago: " + responseLibelula.Message });
                }
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> WebhookPagoExitoso([FromQuery] string transaction_id, [FromQuery] string identificador, [FromBody] WebhookLibelulaDto bodyPayload = null)
        {
            var txId = transaction_id ?? bodyPayload?.transaction_id;
            var ident = identificador ?? bodyPayload?.identificador;

            if (string.IsNullOrEmpty(txId) && string.IsNullOrEmpty(ident))
            {
                return BadRequest(new { error = "No identifiers" });
            }

            TransaccionLibelula transaccion = null;

            if (!string.IsNullOrEmpty(txId))
            {
                transaccion = await _context.TransaccionesLibelula.FirstOrDefaultAsync(t => t.IdTransaccionLibelula == txId);
            }
            
            if (transaccion == null && !string.IsNullOrEmpty(ident))
            {
                transaccion = await _context.TransaccionesLibelula.FirstOrDefaultAsync(t => t.Identificador == ident);
            }

            if (transaccion != null)
            {
                transaccion.Estado = "pagado";
                _context.TransaccionesLibelula.Update(transaccion);
                await _context.SaveChangesAsync();
            }

            return Ok(new { success = true });
        }

        [HttpGet("status-transaccion/{idTransaccion}")]
        public async Task<IActionResult> GetStatusTransaccion(string idTransaccion)
        {
            var transaccion = await _context.TransaccionesLibelula.FirstOrDefaultAsync(t => t.IdTransaccionLibelula == idTransaccion);
            if (transaccion == null)
            {
                return NotFound(new { message = "Transacción no encontrada" });
            }
            return Ok(new { estado = transaccion.Estado });
        }
    }
}
