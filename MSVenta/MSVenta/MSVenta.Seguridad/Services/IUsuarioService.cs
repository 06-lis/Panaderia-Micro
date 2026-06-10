using MSVenta.Seguridad.DTOs;
using MSVenta.Seguridad.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Seguridad.Services
{
    public interface IUsuarioService
    {
        //Task<IEnumerable<Usuario>> GetAllUsuarios();
        Task<IEnumerable<UsuarioDTO>> GetAllUsuarios();

        //Task<Usuario> GetUsuarioById(int id);
        Task<UsuarioDTO> GetUsuarioById(int id);
        
        Task<Usuario> CreateUsuario(Usuario usuario);
        Task UpdateUsuario(Usuario usuario);
        Task DeleteUsuario(int id);

        Usuario Validate(string userName, string password);
    }
}
