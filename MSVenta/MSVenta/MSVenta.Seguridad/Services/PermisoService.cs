using Microsoft.EntityFrameworkCore;
using MSVenta.Seguridad.Models;
using MSVenta.Seguridad.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Seguridad.Services
{
    public class PermisoService : IPermisoService
    {
        private readonly ContextDatabase _context;

        public PermisoService(ContextDatabase context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Permiso>> GetAllPermisos()
        {
            return await _context.Permisos.ToListAsync();
        }

        public async Task<Permiso> GetPermisoById(int id)
        {
            return await _context.Permisos.FindAsync(id);
        }

        public async Task<Permiso> CreatePermiso(Permiso permiso)
        {
            _context.Permisos.Add(permiso);
            await _context.SaveChangesAsync();
            return permiso;
        }

        public async Task UpdatePermiso(Permiso permiso)
        {
            _context.Entry(permiso).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeletePermiso(int id)
        {
            var permiso = await _context.Permisos.FindAsync(id);
            if (permiso != null)
            {
                _context.Permisos.Remove(permiso);
                await _context.SaveChangesAsync();
            }
        }
    }
}
