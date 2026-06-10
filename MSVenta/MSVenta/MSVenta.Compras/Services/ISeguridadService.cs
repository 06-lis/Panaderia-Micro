using System.Threading.Tasks;

namespace MSVenta.Compras.Services
{
    public interface ISeguridadService
    {
        Task<bool> ValidateEmpleadoAsync(int empleadoId);
    }
}
