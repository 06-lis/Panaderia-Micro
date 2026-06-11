using Aforo255.Cross.Http.Src;
using Microsoft.Extensions.Configuration;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace MSVenta.Produccion.Services
{
    public class SeguridadService : ISeguridadService
    {
        private readonly IHttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public SeguridadService(IHttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<bool> ValidateEmpleadoAsync(int empleadoId)
        {
            try
            {
                string baseUrl = _configuration["proxy:urlSeguridad"];
                string url = $"{baseUrl}/empleado/{empleadoId}";

                Console.WriteLine($"[Produccion] GET ValidateEmpleado from: {url}");
                var responseStr = await _httpClient.GetStringAsync(url);
                
                if (!string.IsNullOrEmpty(responseStr))
                {
                    using (var doc = JsonDocument.Parse(responseStr))
                    {
                        var root = doc.RootElement;
                        if (root.TryGetProperty("idEmpleado", out var idProp))
                        {
                            return idProp.GetInt32() == empleadoId;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Produccion] Error validating empleado: {ex.Message}");
            }
            return false;
        }
    }
}
