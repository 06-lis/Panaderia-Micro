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
            try
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
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"Error en Create Venta: {ex.Message} \n {ex.StackTrace}");
                return StatusCode(500, new { message = "Error interno del servidor.", detalle = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Models.Venta venta)
        {
            try
            {
                if (id != venta.Id) return BadRequest();
                await _ventaService.UpdateVenta(venta);
                return NoContent();
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"Error en Update Venta: {ex.Message} \n {ex.StackTrace}");
                return StatusCode(500, new { message = "Error interno del servidor.", detalle = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _ventaService.DeleteVenta(id);
                return NoContent();
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"Error en Delete Venta: {ex.Message} \n {ex.StackTrace}");
                return StatusCode(500, new { message = "Error interno del servidor.", detalle = ex.Message });
            }
        }

        [HttpPut("{id}/completar-pago-libelula")]
        public async Task<IActionResult> CompletarPagoLibelula(int id, [FromBody] MSVenta.Venta.DTOs.CompletarPagoDto payload = null)
        {
            try
            {
                await _ventaService.CompletarPagoLibelula(id, payload?.UsuarioId);
                return Ok(new { message = "Transacción marcada como completada exitosamente." });
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"Error en CompletarPagoLibelula: {ex.Message} \n {ex.StackTrace}");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
