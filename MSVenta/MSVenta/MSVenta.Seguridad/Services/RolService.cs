using Microsoft.EntityFrameworkCore;
using MSVenta.Seguridad.Models;
using MSVenta.Seguridad.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Seguridad.Services
{
    public class RolService : IRolService
    {
        private readonly ContextDatabase _context;

        public RolService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Rol>> GetAllRoles()
        {
            return await _context.Roles.
                    Include(dv => dv.RolPermisos)
                        .ThenInclude(c => c.Permiso)
                    //Include(dv => dv.RolPermisos)
                    //    .ThenInclude(c => c.Rol)
                    .ToListAsync();
            
        }

        public async Task<Rol> GetRolById(int id)
        {
            return await _context.Roles.
                    Include(dv => dv.RolPermisos)
                        .ThenInclude(c => c.Rol)
                    .FirstOrDefaultAsync(dv => dv.ID_Rol == id);
        }

        public async Task<Rol> CreateRol(Rol rol)
        {
            _context.Roles.Add(rol);
            await _context.SaveChangesAsync();
            return rol;
        }

        public async Task UpdateRol(Rol rol)
        {
            _context.Entry(rol).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteRol(int id)
        {
            var rol = await _context.Roles.FindAsync(id);
            if (rol != null)
            {
                _context.Roles.Remove(rol);
                await _context.SaveChangesAsync();
            }
        }
    }
}
