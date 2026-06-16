using Aforo255.Cross.Http.Src;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;

namespace MSVenta.Inventario.Services
{
    public interface IVentaProxyService
    {
        Task<bool> SincronizarStockAgregadoAsync(int itemId, int almacenId, decimal cantidad);
    }

    public class VentaProxyService : IVentaProxyService
    {
        private readonly IHttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public VentaProxyService(IHttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<bool> SincronizarStockAgregadoAsync(int itemId, int almacenId, decimal cantidad)
        {
            try
            {
                string uri = _configuration["proxy:urlVenta"];
                var url = $"{uri}/update-stock";

                var dto = new { ItemId = itemId, AlmacenId = almacenId, Cantidad = (int)cantidad };
                Console.WriteLine($"Sincronizando stock agregado en url {url} con ItemId={itemId}, AlmacenId={almacenId}, Cantidad={(int)cantidad}");
                var response = await _httpClient.PostAsync(url, dto);

                if (!response.IsSuccessStatusCode)
                {
                     Console.WriteLine($"Sincronización falló con StatusCode={response.StatusCode}");
                }
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sincronizando stock con Venta: {ex.Message}");
                return false;
            }
        }
    }
}
