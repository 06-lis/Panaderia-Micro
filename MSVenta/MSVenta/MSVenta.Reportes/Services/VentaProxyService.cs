using Aforo255.Cross.Http.Src;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

namespace MSVenta.Reportes.Services
{
    public class VentaProxyService : IVentaProxyService
    {
        private readonly IHttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public VentaProxyService(IHttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<IEnumerable<dynamic>> GetVentasAsync()
        {
            try
            {
                string url = $"{_configuration["proxy:urlVenta"]}/venta";
                var response = await _httpClient.GetStringAsync(url);
                if (!string.IsNullOrEmpty(response))
                {
                    return JsonSerializer.Deserialize<IEnumerable<dynamic>>(response);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting ventas: {ex.Message}");
            }
            return new List<dynamic>();
        }
        public async Task<IEnumerable<dynamic>> GetDetalleVentasAsync()
        {
            try
            {
                string url = $"{_configuration["proxy:urlVenta"]}/detalleventa";
                var response = await _httpClient.GetStringAsync(url);
                if (!string.IsNullOrEmpty(response))
                {
                    return JsonSerializer.Deserialize<IEnumerable<dynamic>>(response);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting detalle ventas: {ex.Message}");
            }
            return new List<dynamic>();
        }

        public async Task<IEnumerable<dynamic>> GetProductoAlmacenesAsync()
        {
            try
            {
                string url = $"{_configuration["proxy:urlVenta"]}/productoalmacen";
                var response = await _httpClient.GetStringAsync(url);
                if (!string.IsNullOrEmpty(response))
                {
                    return JsonSerializer.Deserialize<IEnumerable<dynamic>>(response);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting producto almacenes: {ex.Message}");
            }
            return new List<dynamic>();
        }
    }
}
