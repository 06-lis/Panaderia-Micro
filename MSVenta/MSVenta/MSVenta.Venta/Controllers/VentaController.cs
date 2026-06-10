using Microsoft.AspNetCore.Mvc;
using MSVenta.Venta.Services;
using System.Threading.Tasks;

namespace MSVenta.Venta.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VentaController : Controller
    {
        private readonly IVentaService _ventaService;
        private readonly IUsuarioService _usuarioService;   // Inyectar el servicio de Usuario

        public VentaController(IVentaService ventaService, IUsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
            _ventaService = ventaService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _ventaService.GetAllVentas());

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id) => Ok(await _ventaService.GetVenta(id));

        [HttpPost]
        public async Task<IActionResult> Create(Models.Venta venta)
        {
            // Validar si el Usuario existe y es válido antes de procesar la venta
            var usuarioValid = await _usuarioService.ValidateUsuario(venta.UsuarioId);
            if (!usuarioValid)
            {
                return BadRequest(new { Message = "El Usuario no es válido." });
            }
            await _ventaService.CreateVenta(venta);
            return CreatedAtAction(nameof(Get), new { id = venta.Id }, venta);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Models.Venta venta)
        {
            if (id != venta.Id) return BadRequest();
            await _ventaService.UpdateVenta(venta);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _ventaService.DeleteVenta(id);
            return NoContent();
        }

    }
}
