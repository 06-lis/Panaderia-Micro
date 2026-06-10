using Aforo255.Cross.Http.Src;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using System;
using System.Threading.Tasks;

namespace MSVenta.Compras.Services
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
                string uri = _configuration["proxy:urlSecurity"];
                var url = $"{uri.Replace("/usuario", "/empleado")}/{empleadoId}";

                var response = await _httpClient.GetStringAsync(url);
                if (!string.IsNullOrEmpty(response))
                {
                    var jsonResponse = JObject.Parse(response);
                    var idEmpleado = jsonResponse["idEmpleado"]?.Value<int>();
                    if (idEmpleado == empleadoId)
                    {
                        return true;
                    }
                }
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error validating empleado: {ex.Message}");
                return false;
            }
        }
    }
}
