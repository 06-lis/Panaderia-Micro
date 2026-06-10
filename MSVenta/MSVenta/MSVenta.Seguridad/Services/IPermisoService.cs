using MSVenta.Seguridad.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Seguridad.Services
{
    public interface IPermisoService
    {
        Task<IEnumerable<Permiso>> GetAllPermisos();
        Task<Permiso> GetPermisoById(int id);
        Task<Permiso> CreatePermiso(Permiso permiso);
        Task UpdatePermiso(Permiso permiso);
        Task DeletePermiso(int id);
    }
}
