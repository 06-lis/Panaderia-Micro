using Aforo255.Cross.Http.Src;
using Microsoft.Extensions.Configuration;
using MSVenta.Compras.DTOs;
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace MSVenta.Compras.Services
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

        public async Task<bool> UpdateStockAsync(UpdateStockDto dto)
        {
            int maxRetries = 3;
            for (int i = 0; i < maxRetries; i++)
            {
                try
                {
                    string uri = _configuration["proxy:urlVenta"];
                    var url = $"{uri}/ingreso";

                    Console.WriteLine($"Sending stock update to {url} with ItemId={dto.ItemId}, AlmacenId={dto.AlmacenId}, Cantidad={dto.Cantidad}");
                    var response = await _httpClient.PostAsync(url, dto);
                    
                    Console.WriteLine($"Response status: {response.StatusCode}");
                    if (!response.IsSuccessStatusCode)
                    {
                        var resStr = await response.Content.ReadAsStringAsync();
                        Console.WriteLine($"Response body: {resStr}");
                    }
                    return response.IsSuccessStatusCode;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error updating stock (Attempt {i + 1}/{maxRetries}): {ex.Message}");
                    if (i == maxRetries - 1) return false;
                    await Task.Delay(1000); // Esperar 1 segundo antes de reintentar
                }
            }
            return false;
        }
    }
}
