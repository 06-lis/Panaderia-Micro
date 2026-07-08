using Microsoft.AspNetCore.Mvc;
using MSVenta.Reportes.DTOs;
using MSVenta.Reportes.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace MSVenta.Reportes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportesController : ControllerBase
    {
        private readonly IVentaProxyService _ventaProxy;
        private readonly ICompraProxyService _compraProxy;
        private readonly IProduccionProxyService _produccionProxy;
        private readonly IInventarioProxyService _inventarioProxy;
        private readonly IEmailService _emailService;

        public ReportesController(
            IVentaProxyService ventaProxy, 
            ICompraProxyService compraProxy, 
            IProduccionProxyService produccionProxy, 
            IInventarioProxyService inventarioProxy,
            IEmailService emailService)
        {
            _ventaProxy = ventaProxy;
            _compraProxy = compraProxy;
            _produccionProxy = produccionProxy;
            _inventarioProxy = inventarioProxy;
            _emailService = emailService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var dto = new DashboardDto();
            
            try 
            {
                var ventas = await _ventaProxy.GetVentasAsync();
                var compras = await _compraProxy.GetComprasAsync();
                var producciones = await _produccionProxy.GetProduccionesAsync();
                var lotes = await _inventarioProxy.GetLotesAsync();
                var detallesVenta = await _ventaProxy.GetDetalleVentasAsync();
                var productoAlmacenes = await _ventaProxy.GetProductoAlmacenesAsync();

                dto.TotalVentas = ventas.Count();
                dto.TotalCompras = compras.Count();
                dto.ProduccionesCompletadas = producciones.Count();
                
                // Agrupar stock para Insumos Bajo Stock y Productos con Poco Stock
                var stockAgrupado = new Dictionary<int, decimal>();
                foreach (var l in lotes)
                {
                    int idItem = 0;
                    if (l.TryGetProperty("idItem", out JsonElement itemElem1)) idItem = itemElem1.GetInt32();
                    else if (l.TryGetProperty("IdItem", out JsonElement itemElem2)) idItem = itemElem2.GetInt32();
                    else if (l.TryGetProperty("id_item", out JsonElement itemElem3)) idItem = itemElem3.GetInt32();

                    decimal cant = 0;
                    if (l.TryGetProperty("cantidadDisponible", out JsonElement cantElem1)) cant = cantElem1.GetDecimal();
                    else if (l.TryGetProperty("CantidadDisponible", out JsonElement cantElem2)) cant = cantElem2.GetDecimal();
                    else if (l.TryGetProperty("cantidad_disponible", out JsonElement cantElem3)) cant = cantElem3.GetDecimal();

                    if (idItem > 0)
                    {
                        if (!stockAgrupado.ContainsKey(idItem)) stockAgrupado[idItem] = 0;
                        stockAgrupado[idItem] += cant;
                    }
                }

                // Lógica de 30 días
                DateTime fechaLimite = DateTime.Now.AddDays(-30);
                
                // --- 1. Operaciones Por Fecha ---
                var dictFechas = new Dictionary<string, OperacionPorFechaDto>();

                // Rellenar 30 días vacíos para que el gráfico no se rompa
                for (int i = 30; i >= 0; i--)
                {
                    string fStr = DateTime.Now.AddDays(-i).ToString("MM/dd");
                    if (!dictFechas.ContainsKey(fStr))
                    {
                        dictFechas[fStr] = new OperacionPorFechaDto { Fecha = fStr };
                    }
                }

                // Procesar Ventas
                foreach (var v in ventas)
                {
                    if (v.TryGetProperty("fecha", out JsonElement fechaElem) && fechaElem.ValueKind != JsonValueKind.Null)
                    {
                        if (DateTime.TryParse(fechaElem.GetString(), out DateTime fechaReal))
                        {
                            if (fechaReal >= fechaLimite)
                            {
                                string key = fechaReal.ToString("MM/dd");
                                if (dictFechas.ContainsKey(key))
                                {
                                    dictFechas[key].CantidadVentas++;
                                }
                            }
                        }
                    }
                }

                // Procesar Compras
                foreach (var c in compras)
                {
                    if (c.TryGetProperty("fechaCompra", out JsonElement fechaElem) && fechaElem.ValueKind != JsonValueKind.Null)
                    {
                        if (DateTime.TryParse(fechaElem.GetString(), out DateTime fechaReal))
                        {
                            if (fechaReal >= fechaLimite)
                            {
                                string key = fechaReal.ToString("MM/dd");
                                if (dictFechas.ContainsKey(key))
                                {
                                    dictFechas[key].CantidadCompras++;
                                    
                                    if (c.TryGetProperty("montoTotal", out JsonElement totalElem) && totalElem.ValueKind == JsonValueKind.Number)
                                    {
                                        dictFechas[key].MontoCompras += totalElem.GetDecimal();
                                    }
                                }
                            }
                        }
                    }
                }

                dto.OperacionesPorFecha = dictFechas.Values.ToList();

                // --- 2. Productos por Vencer ---
                var hoy = DateTime.Now;
                var limiteVencimiento = hoy.AddDays(30);

                foreach (var l in lotes)
                {
                    bool hasFv = l.TryGetProperty("fechaVencimiento", out JsonElement fvElem) || 
                                 l.TryGetProperty("FechaVencimiento", out fvElem) || 
                                 l.TryGetProperty("fecha_vencimiento", out fvElem);

                    if (hasFv && fvElem.ValueKind != JsonValueKind.Null)
                    {
                        if (DateTime.TryParse(fvElem.GetString(), out DateTime fv))
                        {
                            if (fv <= limiteVencimiento)
                            {
                                int idLote = 0;
                                if (l.TryGetProperty("idLote", out JsonElement loteElem) || l.TryGetProperty("IdLote", out loteElem) || l.TryGetProperty("id_lote", out loteElem))
                                    idLote = loteElem.GetInt32();

                                int idAlmacen = 0;
                                if (l.TryGetProperty("idAlmacen", out JsonElement almElem) || l.TryGetProperty("IdAlmacen", out almElem) || l.TryGetProperty("id_almacen", out almElem))
                                    idAlmacen = almElem.GetInt32();

                                decimal cant = 0;
                                if (l.TryGetProperty("cantidadDisponible", out JsonElement cElem) || l.TryGetProperty("CantidadDisponible", out cElem) || l.TryGetProperty("cantidad_disponible", out cElem))
                                    cant = cElem.GetDecimal();
                                
                                string estado = fv < hoy ? "Vencido" : "Próximo a Vencer";

                                dto.ProductosPorVencer.Add(new ProductoVencimientoDto
                                {
                                    IdLote = idLote,
                                    NombreAlmacen = $"Almacén {idAlmacen}", // Idealmente traeríamos el nombre real del proxy
                                    FechaVencimiento = fv,
                                    CantidadDisponible = cant,
                                    Estado = estado
                                });
                            }
                        }
                    }
                }

                // --- 3. Items Más Usados/Vendidos ---
                // Pre-mapear Nombres de Productos Almacen
                var dictProductos = new Dictionary<int, string>();
                foreach (var p in productoAlmacenes)
                {
                    if (p.TryGetProperty("id", out JsonElement idElem) && idElem.ValueKind == JsonValueKind.Number)
                    {
                        int id = idElem.GetInt32();
                        string nombre = $"Prod. Almacén {id}";
                        if (p.TryGetProperty("item", out JsonElement itemElem) && itemElem.ValueKind == JsonValueKind.Object)
                        {
                            if (itemElem.TryGetProperty("nombre", out JsonElement nombreElem) && nombreElem.ValueKind == JsonValueKind.String)
                            {
                                nombre = nombreElem.GetString();
                            }
                        }
                        dictProductos[id] = nombre;
                    }
                }

                var ventasAgrupadas = new Dictionary<int, int>();
                foreach (var dv in detallesVenta)
                {
                    if (dv.TryGetProperty("productoAlmacenId", out JsonElement pid) && pid.ValueKind == JsonValueKind.Number)
                    {
                        int id = pid.GetInt32();
                        int cant = 0;
                        if (dv.TryGetProperty("cantidad", out JsonElement c) && c.ValueKind == JsonValueKind.Number) cant = c.GetInt32();
                        
                        if (!ventasAgrupadas.ContainsKey(id)) ventasAgrupadas[id] = 0;
                        ventasAgrupadas[id] += cant;
                    }
                }

                var top5 = ventasAgrupadas.OrderByDescending(x => x.Value).Take(5).ToList();
                foreach (var t in top5)
                {
                    string nombreItem = dictProductos.ContainsKey(t.Key) ? dictProductos[t.Key] : $"Prod. Almacén {t.Key}";
                    dto.ItemsMasUsados.Add(new ItemMasUsadoDto
                    {
                        IdProductoAlmacen = t.Key,
                        NombreItem = nombreItem,
                        CantidadVendida = t.Value
                    });
                }

                // Generar Productos con Poco Stock e InsumosBajoStock
                int bajoStockContador = 0;
                foreach (var kvp in stockAgrupado)
                {
                    if (kvp.Value < 20)
                    {
                        bajoStockContador++;
                        string nombreItem = dictProductos.ContainsKey(kvp.Key) ? dictProductos[kvp.Key] : $"Item {kvp.Key}";
                        dto.ProductosConPocoStock.Add(new ProductoPocoStockDto
                        {
                            IdItem = kvp.Key,
                            NombreItem = nombreItem,
                            StockTotal = kvp.Value
                        });
                    }
                }
                dto.InsumosBajoStock = bajoStockContador;
            }
            catch(Exception ex)
            {
                Console.WriteLine($"Error aggregating dashboard: {ex.Message}");
            }
            
            return Ok(dto);
        }
        [HttpPost("enviar-dashboard")]
        public async Task<IActionResult> EnviarDashboard([FromBody] EmailRequestDto request)
        {
            if (request == null || request.Destinatarios == null || !request.Destinatarios.Any())
                return BadRequest("Se requiere al menos un destinatario.");

            // Filtrar correos válidos para este proyecto
            var destinatariosValidos = request.Destinatarios
                .Where(e => e.EndsWith("@panaderia-otto.shop"))
                .ToList();

            if (!destinatariosValidos.Any())
                return BadRequest("Ningún correo válido provisto. Deben terminar en @panaderia-otto.shop");

            // Re-utilizar la lógica de Dashboard
            var result = await GetDashboard();
            if (result is OkObjectResult okResult && okResult.Value is DashboardDto dto)
            {
                // Generar HTML
                string html = $@"
                    <h2>Reporte del Sistema Panadería Otto</h2>
                    <p><strong>Total Ventas (30 días):</strong> {dto.TotalVentas}</p>
                    <p><strong>Total Compras (30 días):</strong> {dto.TotalCompras}</p>
                    <p><strong>Producciones Completadas:</strong> {dto.ProduccionesCompletadas}</p>
                    <p><strong>Insumos Bajo Stock / En Lotes:</strong> {dto.InsumosBajoStock}</p>

                    <h3>Productos Próximos a Vencer</h3>
                    <table border='1' cellpadding='5' cellspacing='0'>
                        <tr><th>Lote ID</th><th>Almacén</th><th>Vencimiento</th><th>Cantidad</th><th>Estado</th></tr>";
                
                foreach (var p in dto.ProductosPorVencer)
                {
                    html += $"<tr><td>{p.IdLote}</td><td>{p.NombreAlmacen}</td><td>{p.FechaVencimiento?.ToShortDateString() ?? "N/A"}</td><td>{p.CantidadDisponible}</td><td>{p.Estado}</td></tr>";
                }
                
                html += @"</table>
                    <h3>Items Más Vendidos</h3>
                    <table border='1' cellpadding='5' cellspacing='0'>
                        <tr><th>Producto</th><th>Cantidad Vendida</th></tr>";
                
                foreach (var i in dto.ItemsMasUsados)
                {
                    html += $"<tr><td>{i.NombreItem}</td><td>{i.CantidadVendida}</td></tr>";
                }
                
                html += @"</table>
                    <h3>Productos con Poco Stock</h3>
                    <table border='1' cellpadding='5' cellspacing='0'>
                        <tr><th>Producto</th><th>Stock Total</th></tr>";
                
                foreach (var p in dto.ProductosConPocoStock)
                {
                    html += $"<tr><td>{p.NombreItem}</td><td>{p.StockTotal}</td></tr>";
                }

                html += "</table>";

                try
                {
                    byte[] attachmentBytes = null;
                    string attachmentName = null;
                    if (!string.IsNullOrEmpty(request.Base64Pdf))
                    {
                        try
                        {
                            // Eliminar el prefijo data:image/png;base64, si viene
                            var base64Data = request.Base64Pdf.Contains(",") ? request.Base64Pdf.Split(',')[1] : request.Base64Pdf;
                            attachmentBytes = Convert.FromBase64String(base64Data);
                            attachmentName = $"Reporte_Dashboard_{DateTime.Now:yyyyMMdd}.pdf";
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Error decoding Base64 PDF: {ex.Message}");
                        }
                    }

                    await _emailService.SendEmailAsync(destinatariosValidos, request.Asunto ?? "Reporte de Sistema", html, attachmentBytes, attachmentName);
                    return Ok(new { success = true, message = "Reporte enviado exitosamente." });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error sending email: {ex.Message}");
                    return StatusCode(500, $"Error enviando correo: {ex.Message}");
                }
            }

            return StatusCode(500, "Error generando reporte");
        }
    }
}
