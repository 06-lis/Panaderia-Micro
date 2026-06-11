using System.Threading.Tasks;

namespace MSVenta.Produccion.Services
{
    public interface ISeguridadService
    {
        Task<bool> ValidateEmpleadoAsync(int empleadoId);
    }
}
