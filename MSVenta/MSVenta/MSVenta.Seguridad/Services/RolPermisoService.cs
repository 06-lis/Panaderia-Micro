using Microsoft.EntityFrameworkCore;
using MSVenta.Seguridad.Models;
using MSVenta.Seguridad.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Seguridad.Services
{
    public class RolPermisoService : IRolPermisoService
    {
        private readonly ContextDatabase _context;

        public RolPermisoService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RolPermiso>> GetAllRolPermisos()
        {
            return await _context.RolPermisos
                .Include(rp => rp.Rol)
                //    .ThenInclude(r => r.Nombre_Rol)
                //.Include(rp => rp.Permiso)
                //    .ThenInclude(p => p.Nombre_Permiso)
                .ToListAsync();

            /*
             return await _context.DetallesVenta
                  .Include(dv => dv.Venta)
                    .ThenInclude(c => c.Cliente)
                  .Include(dv => dv.ProductoAlmacen)
                    .ThenInclude(p => p.Producto)
                        .ThenInclude(c => c.Categoria)
                  .Include(dv => dv.ProductoAlmacen)
                    .ThenInclude(a => a.Almacen)
                  .FirstOrDefaultAsync(dv => dv.Id == id);
             */
        }

        public async Task<RolPermiso> GetRolPermisoById(int id)
        {
            return await _context.RolPermisos
                .Include(rp => rp.Rol)
                .Include(rp => rp.Permiso)
                .FirstOrDefaultAsync(rp => rp.ID_Rol_Permiso == id);
        }

        //public async Task<bool> DeleteRolPermiso(int id)
        //{
        //    var rolPermiso = await _context.RolPermisos.FindAsync(id);

        //    if (rolPermiso == null)
        //    {
        //        return false;
        //    }

        //    _context.RolPermisos.Remove(rolPermiso);
        //    await _context.SaveChangesAsync();
        //    return true;
        //}

        public async Task<RolPermiso> CreateRolPermiso(RolPermiso rolPermiso)
        {
            _context.RolPermisos.Add(rolPermiso);
            await _context.SaveChangesAsync();
            return rolPermiso;
        }

        public async Task UpdateRolPermiso(RolPermiso rolPermiso)
        {
            _context.Entry(rolPermiso).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteRolPermiso(int id)
        {
            var rolPermiso = await _context.RolPermisos.FindAsync(id);
            if (rolPermiso != null)
            {
                _context.RolPermisos.Remove(rolPermiso);
                await _context.SaveChangesAsync();
            }
        }
    }
}
