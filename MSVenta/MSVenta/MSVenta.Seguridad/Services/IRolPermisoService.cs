using MSVenta.Seguridad.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Seguridad.Services
{
    public interface IRolPermisoService
    {
        Task<IEnumerable<RolPermiso>> GetAllRolPermisos();
        Task<RolPermiso> GetRolPermisoById(int id);
        Task<RolPermiso> CreateRolPermiso(RolPermiso rolPermiso);
        Task UpdateRolPermiso(RolPermiso rolPermiso);
        Task DeleteRolPermiso(int id);
    }
}
