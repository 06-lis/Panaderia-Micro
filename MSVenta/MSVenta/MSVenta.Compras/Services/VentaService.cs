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
            try
            {
                string uri = _configuration["proxy:urlVenta"];
                var url = $"{uri}/update-stock";

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
                Console.WriteLine($"Error updating stock: {ex.Message}");
                return false;
            }
        }
    }
}
