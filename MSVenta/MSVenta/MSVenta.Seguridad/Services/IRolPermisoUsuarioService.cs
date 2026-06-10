using MSVenta.Seguridad.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Seguridad.Services
{
    public interface IRolPermisoUsuarioService
    {
        Task<IEnumerable<RolPermisoUsuario>> GetAllRolPermisoUsuarios();
        Task<RolPermisoUsuario> GetRolPermisoUsuarioById(int id);
        Task<RolPermisoUsuario> CreateRolPermisoUsuario(RolPermisoUsuario rolPermisoUsuario);
        Task UpdateRolPermisoUsuario(RolPermisoUsuario rolPermisoUsuario);
        Task DeleteRolPermisoUsuario(int id);
    }
}
