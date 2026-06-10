using MSVenta.Seguridad.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Seguridad.Services
{
    public interface IEmpleadoService
    {
        Task<IEnumerable<Empleado>> GetAllEmpleados();
        Task<Empleado> GetEmpleadoById(int id);
        Task<Empleado> CreateEmpleado(Empleado empleado);
        Task UpdateEmpleado(Empleado empleado);
        Task DeleteEmpleado(int id);
    }
}
