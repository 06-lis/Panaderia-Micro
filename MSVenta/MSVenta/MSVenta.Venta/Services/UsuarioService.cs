using Aforo255.Cross.Http.Src;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using System.Threading.Tasks;
using System;

namespace MSVenta.Venta.Services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly IHttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public UsuarioService(IHttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<string> GetUsuario(int usuario_id)
        {
            string uri = _configuration["proxy:urlSecurity"];
            var url = $"{uri}/{usuario_id}";
            // Realiza la solicitud GET y obtiene la respuesta
            var response = await _httpClient.GetStringAsync(url);
            // Verifica si la respuesta no está vacía
            if (!string.IsNullOrEmpty(response))
            {
                return response;
            }
            return null; // Agregar una declaración de retorno predeterminada
        }

        public async Task<bool> ValidateUsuario(int usuario_id)
        {
            try
            {
                string uri = _configuration["proxy:urlSecurity"];
                var url = $"{uri}/{usuario_id}/validate";

                // Realiza la solicitud GET y obtiene la respuesta
                var response = await _httpClient.GetStringAsync(url);

                // Verifica si la respuesta no está vacía
                if (!string.IsNullOrEmpty(response))
                {
                    // Deserializa la respuesta JSON
                    var jsonResponse = JObject.Parse(response);

                    var message = jsonResponse["message"]?.ToString();
                    if (message != null && message.Contains("Usuario no encontrado."))
                    {
                        return false;
                    }

                    return true;
                }
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error validating usuario: {ex.Message}");
                return false;
            }
        }
    }
}
