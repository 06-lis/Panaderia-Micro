using Aforo255.Cross.Token.Src;
using Consul;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MSVenta.Seguridad.DTOs;
using MSVenta.Seguridad.Services;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Seguridad.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : Controller
    {
        private readonly IUsuarioService _accessService;
        private readonly JwtOptions _jwtOption;
        public AuthController(IUsuarioService accessService,
            IOptionsSnapshot<JwtOptions> jwtOption)
        {
            _accessService = accessService;
            _jwtOption = jwtOption.Value;
        }

        public IActionResult Get()
        {
            return Ok(_accessService.GetAllUsuarios());
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] AuthRequest request)
        {
            // Validamos las credenciales del usuario
            var usuario = _accessService.Validate(request.UserName, request.Password);

            if (usuario == null)
            {
                return Unauthorized();
            }

            // Obtenemos los permisos del usuario
            UsuarioDTO userPermisos = await _accessService.GetUsuarioById(usuario.UserId);

            // Generamos el token JWT
            var token = JwtToken.Create(_jwtOption);

            // Configuramos los headers de respuesta
            Response.Headers.Add("access-control-expose-headers", "Authorization");
            Response.Headers.Add("Authorization", token);

            // Estructuramos la respuesta de manera clara
            var response = new
            {
                
                user = new
                {
                    userPermisos.UserId,
                    userPermisos.Fullname,
                    userPermisos.Username,
                    Roles = userPermisos.Roles.Select(role => new
                    {
                        role.ID_Rol,
                        role.Nombre_Rol,
                        Permisos = role.Permisos.Select(permiso => new
                        {
                            permiso.ID_Permiso,
                            permiso.Nombre_Permiso
                        })
                    }),

                    token,
                }
            };

            return Ok(response);
            //return Ok(new { token =  JwtToken.Create(_jwtOption) });
        }
        
    }
}
