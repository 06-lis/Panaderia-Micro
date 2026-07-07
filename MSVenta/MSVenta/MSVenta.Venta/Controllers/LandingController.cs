using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.DTOs;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using MSVenta.Venta.Services;
using System;
using System.Linq;
using System.Threading.Tasks;
using Aforo255.Cross.Http.Src;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using System.Collections.Generic;

namespace MSVenta.Venta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LandingController : ControllerBase
    {
        private readonly ContextDatabase _context;
        private readonly ILibelulaService _libelulaService;
        private readonly IInventarioService _inventarioService;
        private readonly IHttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public LandingController(ContextDatabase context, 
            ILibelulaService libelulaService, 
            IInventarioService inventarioService,
            IHttpClient httpClient,
            IConfiguration configuration)
        {
            _context = context;
            _libelulaService = libelulaService;
            _inventarioService = inventarioService;
            _httpClient = httpClient;
            _configuration = configuration;
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
                    AlmacenId = pa.AlmacenId,
                    Nombre = pa.Item.Nombre,
                    Precio = pa.Item.Precio,
                    Stock = pa.Stock,
                    Imagen = ((Producto)pa.Item).Imagen
                })
                .ToListAsync();

            // Fetch lotes and config
            string lotesJson = await _inventarioService.GetLotesAsync();
            string configJson = await _inventarioService.GetConfiguracionAsync();

            string metodo = "PEPS"; // Default
            try
            {
                using var configDoc = JsonDocument.Parse(configJson);
                if (configDoc.RootElement.ValueKind == JsonValueKind.Object && configDoc.RootElement.TryGetProperty("metodo_valuacion", out var val))
                {
                    metodo = val.GetString()?.ToUpper() ?? "PEPS";
                }
            }
            catch {}

            var lotesList = new List<dynamic>();
            try
            {
                using var lotesDoc = JsonDocument.Parse(lotesJson);
                if (lotesDoc.RootElement.ValueKind == JsonValueKind.Array)
                {
                    foreach (var l in lotesDoc.RootElement.EnumerateArray())
                    {
                        var id_item = l.GetProperty("id_item").GetInt32();
                        var id_almacen = l.GetProperty("id_almacen").GetInt32();
                        var fecha_entrada = l.GetProperty("fecha_entrada").GetDateTime();
                        var cantidad_disponible = l.GetProperty("cantidad_disponible").GetDecimal();
                        lotesList.Add(new { id_item, id_almacen, fecha_entrada, cantidad_disponible });
                    }
                }
            }
            catch {}

            // Now deduplicate productos
            var grouped = productos.GroupBy(p => p.ItemId);
            var finalProducts = new List<object>();

            foreach(var g in grouped)
            {
                if (g.Count() == 1)
                {
                    finalProducts.Add(new
                    {
                        ProductoAlmacenId = g.First().ProductoAlmacenId,
                        ItemId = g.First().ItemId,
                        Nombre = g.First().Nombre,
                        Precio = g.First().Precio,
                        Stock = g.Sum(x => x.Stock),
                        Imagen = g.First().Imagen
                    });
                }
                else
                {
                    // Find the best almacen for this item
                    var matchingLotes = lotesList.Where(l => l.id_item == g.Key && l.cantidad_disponible > 0).ToList();
                    
                    if (metodo == "UEPS")
                    {
                        matchingLotes = matchingLotes.OrderByDescending(l => l.fecha_entrada).ToList();
                    }
                    else // PEPS
                    {
                        matchingLotes = matchingLotes.OrderBy(l => l.fecha_entrada).ToList();
                    }

                    int selectedAlmacenId = -1;
                    if (matchingLotes.Any())
                    {
                        selectedAlmacenId = matchingLotes.First().id_almacen;
                    }
                    
                    var selectedPa = g.FirstOrDefault(pa => pa.AlmacenId == selectedAlmacenId) ?? g.First();
                    
                    finalProducts.Add(new
                    {
                        ProductoAlmacenId = selectedPa.ProductoAlmacenId,
                        ItemId = selectedPa.ItemId,
                        Nombre = selectedPa.Nombre,
                        Precio = selectedPa.Precio,
                        Stock = g.Sum(x => x.Stock),
                        Imagen = selectedPa.Imagen
                    });
                }
            }

            return Ok(finalProducts);
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

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegistroClienteDto request)
        {
            if (request == null || string.IsNullOrEmpty(request.Nombre) || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Datos de registro inválidos o incompletos." });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Crear el cliente en db_ventas
                var cliente = new Cliente
                {
                    Nombre = request.Nombre,
                    Apellidos = request.Apellido ?? "",
                    Celular = int.TryParse(request.Celular, out var cel) ? cel : 0
                };
                _context.Clientes.Add(cliente);
                await _context.SaveChangesAsync();

                // 2. Comunicarse con la base de datos de Seguridad para crear el Usuario
                string securityUrl = _configuration["proxy:urlSecurity"];
                var usuarioPayload = new
                {
                    Fullname = $"{request.Nombre} {request.Apellido}".Trim(),
                    Username = request.Email,
                    Password = request.Password,
                    IdCliente = cliente.Id
                };

                Console.WriteLine($"[Venta] POST to security: {securityUrl} for email {request.Email}");
                var response = await _httpClient.PostAsync(securityUrl, usuarioPayload);

                if (!response.IsSuccessStatusCode)
                {
                    var errorMsg = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Error al registrar el usuario en el servicio de seguridad: {errorMsg}");
                }

                await transaction.CommitAsync();
                return Ok(new { success = true, message = "Cliente registrado exitosamente.", idCliente = cliente.Id });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"[Venta] Error en Register: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }

    public class RegistroClienteDto
    {
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Celular { get; set; }
    }
}
