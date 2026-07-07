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
            int maxRetries = 3;
            for (int i = 0; i < maxRetries; i++)
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
                         var resStr = await response.Content.ReadAsStringAsync();
                         string msg = $"Error al actualizar stock del Item {itemId} en Almacén {almacenId}.";
                         try
                         {
                             using (var doc = System.Text.Json.JsonDocument.Parse(resStr))
                             {
                                 if (doc.RootElement.TryGetProperty("mensaje", out var p))
                                 {
                                     msg = p.GetString();
                                 }
                             }
                         }
                         catch {}
                         throw new InvalidOperationException(msg);
                    }
                    return true;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error sincronizando stock con Venta (Attempt {i + 1}/{maxRetries}): {ex.Message}");
                    if (i == maxRetries - 1) return false;
                    await Task.Delay(1000); // Esperar 1 segundo antes de reintentar
                }
            }
            return false;
        }
    }
}
