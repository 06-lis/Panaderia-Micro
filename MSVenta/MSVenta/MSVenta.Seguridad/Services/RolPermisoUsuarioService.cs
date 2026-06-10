using Microsoft.EntityFrameworkCore;
using MSVenta.Seguridad.Models;
using MSVenta.Seguridad.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Seguridad.Services
{
    public class RolPermisoUsuarioService : IRolPermisoUsuarioService
    {

        private readonly ContextDatabase _context;

        public RolPermisoUsuarioService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RolPermisoUsuario>> GetAllRolPermisoUsuarios()
        {
            return await _context.RolPermisoUsuarios
                .Include(rpu => rpu.Usuario)
                .Include(rpu => rpu.RolPermiso)
                    .ThenInclude(rp => rp.Rol)
                .Include(rpu => rpu.RolPermiso)
                    .ThenInclude(rp => rp.Permiso)
                .ToListAsync();


        }

        public async Task<RolPermisoUsuario> GetRolPermisoUsuarioById(int id)
        {
            return await _context.RolPermisoUsuarios
                .Include(rpu => rpu.Usuario)
                .Include(rpu => rpu.RolPermiso)
                    .ThenInclude(rp => rp.Rol)
                .Include(rpu => rpu.RolPermiso)
                    .ThenInclude(rp => rp.Permiso)
                .FirstOrDefaultAsync(rpu => rpu.ID_Usuario_Rol_Permiso == id);
        }

        public async Task<RolPermisoUsuario> CreateRolPermisoUsuario(RolPermisoUsuario rolPermisoUsuario)
        {
            _context.RolPermisoUsuarios.Add(rolPermisoUsuario);
            await _context.SaveChangesAsync();
            return rolPermisoUsuario;
        }

        public async Task UpdateRolPermisoUsuario(RolPermisoUsuario rolPermisoUsuario)
        {
            _context.Entry(rolPermisoUsuario).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteRolPermisoUsuario(int id)
        {
            var rolPermisoUsuario = await _context.RolPermisoUsuarios.FindAsync(id);
            if (rolPermisoUsuario != null)
            {
                _context.RolPermisoUsuarios.Remove(rolPermisoUsuario);
                await _context.SaveChangesAsync();
            }
        }
    }
}
