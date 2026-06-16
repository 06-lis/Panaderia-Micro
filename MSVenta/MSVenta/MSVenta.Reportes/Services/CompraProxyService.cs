using Aforo255.Cross.Http.Src;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

namespace MSVenta.Reportes.Services
{
    public class CompraProxyService : ICompraProxyService
    {
        private readonly IHttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public CompraProxyService(IHttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<IEnumerable<dynamic>> GetComprasAsync()
        {
            try
            {
                string url = $"{_configuration["proxy:urlCompra"]}/compra";
                var response = await _httpClient.GetStringAsync(url);
                if (!string.IsNullOrEmpty(response))
                {
                    return JsonSerializer.Deserialize<IEnumerable<dynamic>>(response);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting compras: {ex.Message}");
            }
            return new List<dynamic>();
        }
    }
}
