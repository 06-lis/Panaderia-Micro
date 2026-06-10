using Microsoft.EntityFrameworkCore;
using MSVenta.Seguridad.DTOs;
using MSVenta.Seguridad.Models;
using MSVenta.Seguridad.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Seguridad.Services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly ContextDatabase _context;

        public UsuarioService(ContextDatabase context)
        {
            _context = context;
        }
        

        public async Task<IEnumerable<UsuarioDTO>> GetAllUsuarios()
        {
            var usuarios = await _context.Usuarios
                .Include(u => u.RolPermisoUsuarios)
                    .ThenInclude(rpu => rpu.RolPermiso)
                        .ThenInclude(rp => rp.Rol)
                .Include(u => u.RolPermisoUsuarios)
                    .ThenInclude(rpu => rpu.RolPermiso)
                        .ThenInclude(rp => rp.Permiso)
                .ToListAsync();

            return usuarios.Select(u => new UsuarioDTO
            {
                UserId = u.UserId,
                Fullname = u.Fullname,
                Username = u.Username,
                Roles = u.RolPermisoUsuarios
                    .GroupBy(rpu => new { rpu.RolPermiso.Rol.ID_Rol, rpu.RolPermiso.Rol.Nombre_Rol })
                    .Select(group => new RolDTO
                    {
                        ID_Rol = group.Key.ID_Rol,
                        Nombre_Rol = group.Key.Nombre_Rol,
                        Permisos = group.Select(rpu => new PermisoDTO
                        {
                            ID_Permiso = rpu.RolPermiso.Permiso.ID_Permiso,
                            Nombre_Permiso = rpu.RolPermiso.Permiso.Nombre_Permiso
                        }).ToList()
                    })
                    .ToList()
            });
        }



        public async Task<UsuarioDTO> GetUsuarioById(int id)
        {
            //return await _context.Usuarios.FindAsync(id);
            var usuario = await _context.Usuarios
                .Where(u => u.UserId == id)
                .Include(u => u.RolPermisoUsuarios)
                    .ThenInclude(rpu => rpu.RolPermiso)
                        .ThenInclude(rp => rp.Rol)
                .Include(u => u.RolPermisoUsuarios)
                    .ThenInclude(rpu => rpu.RolPermiso)
                        .ThenInclude(rp => rp.Permiso)
                .FirstOrDefaultAsync();

            if (usuario == null)
                return null;

            // Agrupar los roles y permisos en memoria
            var roles = usuario.RolPermisoUsuarios
                                .GroupBy(rpu => new { rpu.RolPermiso.Rol.ID_Rol, rpu.RolPermiso.Rol.Nombre_Rol })
                                .Select(group => new RolDTO
                                {
                                    ID_Rol = group.Key.ID_Rol,
                                    Nombre_Rol = group.Key.Nombre_Rol,
                                    Permisos = group.Select(rpu => new PermisoDTO
                                    {
                                        ID_Permiso = rpu.RolPermiso.Permiso.ID_Permiso,
                                        Nombre_Permiso = rpu.RolPermiso.Permiso.Nombre_Permiso
                                    }).ToList()
                                })
                                .ToList();

            return new UsuarioDTO
            {
                UserId = usuario.UserId,
                Fullname = usuario.Fullname,
                Username = usuario.Username,
                Roles = roles
            };


        }

        public async Task<Usuario> CreateUsuario(Usuario usuario)
        {
            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
            return usuario;
        }

        public async Task UpdateUsuario(Usuario usuario)
        {
            _context.Entry(usuario).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario != null)
            {
                _context.Usuarios.Remove(usuario);
                await _context.SaveChangesAsync();
            }
        }

        public Usuario Validate(string userName, string password)
        {
            return _context.Usuarios
            .FirstOrDefault(x => x.Username == userName && x.Password == password);

        }

        //public bool Validate(string userName, string password)
        //{
        //    var list = _context.Usuarios.ToList();
        //    var access = list.Where(x => x.Username == userName && x.Password == password)
        //        .FirstOrDefault();

        //    if (access != null)
        //        return true;
        //    return false;
        //}



    }
}
