using Aforo255.Cross.Http.Src;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public interface IInventarioService
    {
        Task<bool> ConsumirStockAsync(int itemId, int almacenId, decimal cantidad, int empleadoId, int? referenciaId = null, string referenciaTipo = null);
    }

    public class InventarioService : IInventarioService
    {
        private readonly IHttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public InventarioService(IHttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<bool> ConsumirStockAsync(int itemId, int almacenId, decimal cantidad, int empleadoId, int? referenciaId = null, string referenciaTipo = null)
        {
            try
            {
                string baseUrl = _configuration["proxy:urlInventario"];
                string url = $"{baseUrl}/consumo";

                var dto = new
                {
                    ItemId = itemId,
                    AlmacenId = almacenId,
                    Cantidad = cantidad,
                    EmpleadoId = empleadoId,
                    ReferenciaId = referenciaId,
                    ReferenciaTipo = referenciaTipo
                };

                Console.WriteLine($"[Venta] POST consumo to: {url} with ItemId={itemId}, AlmacenId={almacenId}, Cantidad={cantidad}");
                var response = await _httpClient.PostAsync(url, dto);
                
                Console.WriteLine($"[Venta] Consumo response code: {response.StatusCode}");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Venta] Error consuming stock: {ex.Message}");
                return false;
            }
        }
    }
}
