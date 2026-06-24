using System.Collections.Generic;
using System.Threading.Tasks;
using MSVenta.Venta.DTOs;

namespace MSVenta.Venta.Services
{
    public interface ILibelulaService
    {
        Task<LibelulaResponseDto> RegistrarPagoAsync(Models.Venta venta, List<CarritoItemDto> items, string nombreCliente, string apellidoCliente, string emailCliente);
    }
}
