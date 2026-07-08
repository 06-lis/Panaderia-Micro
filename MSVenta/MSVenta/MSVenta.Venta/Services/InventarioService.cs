using Aforo255.Cross.Http.Src;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;
using System.Net.Http.Json;

namespace MSVenta.Venta.Services
{
    public interface IInventarioService
    {
        Task<bool> ConsumirStockAsync(int itemId, int almacenId, decimal cantidad, int empleadoId, int? referenciaId = null, string referenciaTipo = null);
        Task<System.Collections.Generic.List<MSVenta.Venta.Models.ConsumoResultado>> ConsumirStockGlobalAsync(int itemId, decimal cantidad, int empleadoId, int? referenciaId = null, string referenciaTipo = null);
        Task<bool> RevertirConsumoGlobalAsync(System.Collections.Generic.List<MSVenta.Venta.Models.ConsumoResultado> consumos, int empleadoId, int? referenciaId = null, string referenciaTipo = null);
        Task<string> GetLotesAsync();
        Task<string> GetConfiguracionAsync();
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

        public async Task<string> GetLotesAsync()
        {
            try
            {
                string baseUrl = _configuration["proxy:urlInventario"];
                using var client = new System.Net.Http.HttpClient();
                var response = await client.GetStringAsync($"{baseUrl}/lotes");
                return response;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Venta] Error fetching lotes: {ex.Message}");
                return "[]";
            }
        }

        public async Task<string> GetConfiguracionAsync()
        {
            try
            {
                string baseUrl = _configuration["proxy:urlInventario"];
                using var client = new System.Net.Http.HttpClient();
                var response = await client.GetStringAsync($"{baseUrl}/configuracion");
                return response;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Venta] Error fetching configuracion: {ex.Message}");
                return "{}";
            }
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
        public async Task<System.Collections.Generic.List<MSVenta.Venta.Models.ConsumoResultado>> ConsumirStockGlobalAsync(int itemId, decimal cantidad, int empleadoId, int? referenciaId = null, string referenciaTipo = null)
        {
            try
            {
                string baseUrl = _configuration["proxy:urlInventario"];
                string url = $"{baseUrl}/consumo-global";

                var dto = new
                {
                    ItemId = itemId,
                    Cantidad = cantidad,
                    EmpleadoId = empleadoId,
                    ReferenciaId = referenciaId,
                    ReferenciaTipo = referenciaTipo
                };

                Console.WriteLine($"[Venta] POST consumo-global to: {url} with ItemId={itemId}, Cantidad={cantidad}");
                
                using var client = new System.Net.Http.HttpClient();
                var response = await client.PostAsJsonAsync(url, dto);
                
                if (response.IsSuccessStatusCode)
                {
                    var resultStr = await response.Content.ReadAsStringAsync();
                    var resObj = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(resultStr);
                    var data = Newtonsoft.Json.JsonConvert.DeserializeObject<System.Collections.Generic.List<MSVenta.Venta.Models.ConsumoResultado>>(resObj.data.ToString());
                    return data;
                }
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Venta] Error consuming global stock: {ex.Message}");
                return null;
            }
        }

        public async Task<bool> RevertirConsumoGlobalAsync(System.Collections.Generic.List<MSVenta.Venta.Models.ConsumoResultado> consumos, int empleadoId, int? referenciaId = null, string referenciaTipo = null)
        {
            try
            {
                string baseUrl = _configuration["proxy:urlInventario"];
                string url = $"{baseUrl}/revertir-consumo-global";

                var dto = new
                {
                    Consumos = consumos,
                    EmpleadoId = empleadoId,
                    ReferenciaId = referenciaId,
                    ReferenciaTipo = referenciaTipo
                };

                using var client = new System.Net.Http.HttpClient();
                var response = await client.PostAsJsonAsync(url, dto);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Venta] Error reverting global stock: {ex.Message}");
                return false;
            }
        }
    }
}
