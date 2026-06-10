using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MSVenta.Seguridad.Models;
using MSVenta.Seguridad.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Seguridad.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuarioController : Controller
    {
        private readonly IUsuarioService _usuarioService;

        public UsuarioController(IUsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuarios()
        {
            var usuarios = await _usuarioService.GetAllUsuarios();
            return Ok(usuarios);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Usuario>> GetUsuario(int id)
        {
            var usuario = await _usuarioService.GetUsuarioById(id);
            return usuario == null ? NotFound() : Ok(usuario);
        }

        [HttpPost]
        public async Task<ActionResult<Usuario>> CreateUsuario(Usuario usuario)
        {
            var createdUsuario = await _usuarioService.CreateUsuario(usuario);
            return CreatedAtAction(nameof(GetUsuario), new { id = createdUsuario.UserId }, createdUsuario);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUsuario(int id, Usuario usuario)
        {
            if (id != usuario.UserId) return BadRequest();

            try
            {
                await _usuarioService.UpdateUsuario(usuario);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await UsuarioExists(id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            await _usuarioService.DeleteUsuario(id);
            return NoContent();
        }

        private async Task<bool> UsuarioExists(int id)
        {
            return await _usuarioService.GetUsuarioById(id) != null;
        }
        public IActionResult Index()
        {
            return View();
        }

        // Validar un cliente
        [HttpGet("{id}/validate")]
        public async Task<IActionResult> ValidateCustomer(int id)
        {
            var customer = await _usuarioService.GetUsuarioById(id);
            if (customer == null)
            {
                return NotFound(new { Message = "Usuario no encontrado." });
            }
            if (customer.UserId!= id)
            {
                return BadRequest(new { Message = "El usuario no es válido." });
            }

            return Ok(new { Message = "El usuario es válido." });
        }
    }
}
