using Microsoft.AspNetCore.Mvc;
using MSVenta.Seguridad.Models;
using MSVenta.Seguridad.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Seguridad.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RolPermisosController : Controller
    {
        private readonly IRolPermisoService _rolPermisoService;

        public RolPermisosController(IRolPermisoService rolPermisoService)
        {
            _rolPermisoService = rolPermisoService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RolPermiso>>> GetRolPermisos()
        {
            var rolpermisos = await _rolPermisoService.GetAllRolPermisos();
            return Ok(rolpermisos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RolPermiso>> GetRolPermiso(int id)
        {
            var rolpermiso = await _rolPermisoService.GetRolPermisoById(id);
            return rolpermiso == null ? NotFound() : Ok(rolpermiso);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRolPermiso(int id)
        {
            var rolPermiso = await _rolPermisoService.GetRolPermisoById(id);

            if (rolPermiso == null)
            {
                return NotFound(new { message = "RolPermiso no encontrado." });
            }

            await _rolPermisoService.DeleteRolPermiso(id);

            return Ok(new { message = "Permiso eliminado correctamente." });
        }

        [HttpPost]
        public async Task<ActionResult<RolPermiso>> CreateRolPermiso(RolPermiso rolpermiso)
        {
            var createdRolPermiso = await _rolPermisoService.CreateRolPermiso(rolpermiso);
            return CreatedAtAction(nameof(GetRolPermiso), new { id = createdRolPermiso.ID_Rol_Permiso}, createdRolPermiso);
        }
        public IActionResult Index()
        {
            return View();
        }
    }
}
