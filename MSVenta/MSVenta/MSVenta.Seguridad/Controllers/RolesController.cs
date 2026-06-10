using Microsoft.AspNetCore.Mvc;
using MSVenta.Seguridad.Models;
using MSVenta.Seguridad.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Seguridad.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RolesController : Controller
    {
        private readonly IRolService _rolService;

        public RolesController(IRolService rolService)
        {
            _rolService = rolService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Rol>>> GetRoles()
        {
            var roles = await _rolService.GetAllRoles();
            return Ok(roles);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Rol>> GetRol(int id)
        {
            var rol = await _rolService.GetRolById(id);
            return rol == null ? NotFound() : Ok(rol);
        }

        [HttpPost]
        public async Task<ActionResult<Rol>> CreateRol(Rol rol)
        {
            var createdRol = await _rolService.CreateRol(rol);
            return CreatedAtAction(nameof(GetRol), new { id = createdRol.ID_Rol }, createdRol);
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _rolService.DeleteRol(id);
            return NoContent();
        }
        public IActionResult Index()
        {
            return View();
        }
    }
}
