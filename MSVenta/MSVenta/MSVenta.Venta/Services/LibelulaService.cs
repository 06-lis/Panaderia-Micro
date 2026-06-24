using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MSVenta.Venta.DTOs;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;

namespace MSVenta.Venta.Services
{
    public class LibelulaService : ILibelulaService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ContextDatabase _context;
        private readonly ILogger<LibelulaService> _logger;

        private readonly string _appKey;
        private readonly string _baseUrl;
        private readonly string _callbackUrl;

        public LibelulaService(HttpClient httpClient, IConfiguration configuration, ContextDatabase context, ILogger<LibelulaService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _context = context;
            _logger = logger;

            _appKey = _configuration["Libelula:AppKey"] ?? "key_pruebas";
            _baseUrl = _configuration["Libelula:BaseUrl"] ?? "https://api.libelula.bo/rest";
            _callbackUrl = _configuration["Libelula:CallbackUrl"] ?? "http://localhost:5000/api/landing/webhook";
        }

        public async Task<LibelulaResponseDto> RegistrarPagoAsync(Models.Venta venta, List<CarritoItemDto> items, string nombreCliente, string apellidoCliente, string emailCliente)
        {
            var identificadorUnico = $"OTTO-{venta.Id}-{Guid.NewGuid().ToString("N").Substring(0, 8)}";
            double montoTotal = 0;

            var lineasDetalle = new List<object>();
            foreach (var item in items)
            {
                lineasDetalle.Add(new
                {
                    concepto = item.Nombre,
                    cantidad = item.Cantidad,
                    costo_unitario = item.Precio,
                    descuento_unitario = 0
                });
                montoTotal += item.Precio * item.Cantidad;
            }

            if (lineasDetalle.Count == 0)
            {
                lineasDetalle.Add(new
                {
                    concepto = "Pedido Panadería Otto",
                    cantidad = 1,
                    costo_unitario = montoTotal,
                    descuento_unitario = 0
                });
            }

            var payload = new
            {
                appkey = _appKey,
                email_cliente = emailCliente,
                identificador = identificadorUnico,
                callback_url = _callbackUrl,
                url_retorno = "http://localhost:8081/principal",
                descripcion = $"Pedido #{venta.Id} - Panadería Otto",
                nombre_cliente = nombreCliente,
                apellido_cliente = apellidoCliente,
                ci = "0",
                moneda = "BOB",
                lineas_detalle_deuda = lineasDetalle
            };

            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            try
            {
                _logger.LogInformation($"Enviando a Libélula: {jsonPayload}");
                var response = await _httpClient.PostAsync($"{_baseUrl}/deuda/registrar", content);
                var responseString = await response.Content.ReadAsStringAsync();
                
                _logger.LogInformation($"Respuesta Libélula: {responseString}");

                using var doc = JsonDocument.Parse(responseString);
                var root = doc.RootElement;

                string urlPasarela = null;
                if (root.TryGetProperty("url_pasarela_pagos", out var urlElement) && urlElement.ValueKind == JsonValueKind.String)
                {
                    urlPasarela = urlElement.GetString();
                }

                if (!string.IsNullOrEmpty(urlPasarela))
                {
                    var idTransaccion = root.TryGetProperty("id_transaccion", out var idElem) ? idElem.GetString() : null;
                    var codRecaudacion = root.TryGetProperty("codigo_recaudacion", out var codElem) ? codElem.GetString() : null;
                    var qrUrl = root.TryGetProperty("qr_simple_url", out var qrElem) ? qrElem.GetString() : null;

                    var transaccion = new TransaccionLibelula
                    {
                        VentaId = venta.Id,
                        Identificador = identificadorUnico,
                        IdTransaccionLibelula = idTransaccion,
                        CodigoRecaudacion = codRecaudacion,
                        Monto = montoTotal,
                        QrUrl = qrUrl,
                        UrlPasarela = urlPasarela,
                        RespuestaApi = responseString,
                        Estado = "pendiente",
                        FechaRegistro = DateTime.UtcNow
                    };

                    _context.TransaccionesLibelula.Add(transaccion);
                    await _context.SaveChangesAsync();

                    return new LibelulaResponseDto
                    {
                        Success = true,
                        QrUrl = qrUrl,
                        UrlPasarela = urlPasarela,
                        IdTransaccion = idTransaccion,
                        CodigoRecaudacion = codRecaudacion,
                        Message = "Pago registrado correctamente"
                    };
                }

                return new LibelulaResponseDto
                {
                    Success = false,
                    Message = root.TryGetProperty("mensaje", out var msgElem) ? msgElem.GetString() : "Error al registrar el pago en Libélula"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Excepción Libélula: {ex.Message}");
                return new LibelulaResponseDto
                {
                    Success = false,
                    Message = $"Error de conexión: {ex.Message}"
                };
            }
        }
    }
}
