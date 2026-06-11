using Aforo255.Cross.Http.Src;
using Microsoft.Extensions.Configuration;
using MSVenta.Produccion.DTOs;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace MSVenta.Produccion.Services
{
    public class VentaService : IVentaService
    {
        private readonly IHttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public VentaService(IHttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<ProductoAlmacenDto> GetStockAsync(int itemId, int almacenId)
        {
            try
            {
                string baseUrl = _configuration["proxy:urlVenta"];
                string url = $"{baseUrl}/productoalmacen/stock/{itemId}/{almacenId}";

                Console.WriteLine($"[Produccion] GET Stock from: {url}");
                var responseStr = await _httpClient.GetStringAsync(url);
                
                if (!string.IsNullOrEmpty(responseStr))
                {
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    var result = JsonSerializer.Deserialize<ProductoAlmacenDto>(responseStr, options);
                    return result;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Produccion] Error retrieving stock: {ex.Message}");
            }
            return new ProductoAlmacenDto { ItemId = itemId, AlmacenId = almacenId, Stock = 0 };
        }

        public async Task<bool> UpdateStockAsync(UpdateStockDto dto)
        {
            try
            {
                string baseUrl = _configuration["proxy:urlVenta"];
                string url = $"{baseUrl}/productoalmacen/update-stock";

                Console.WriteLine($"[Produccion] POST update-stock to: {url} with ItemId={dto.ItemId}, AlmacenId={dto.AlmacenId}, Cantidad={dto.Cantidad}");
                var response = await _httpClient.PostAsync(url, dto);
                
                Console.WriteLine($"[Produccion] UpdateStock response code: {response.StatusCode}");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Produccion] Error updating stock: {ex.Message}");
                return false;
            }
        }
    }
}
