using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using MSVenta.Inventario.Services;

namespace MSVenta.Inventario.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TraspasoController : ControllerBase
    {
        private readonly ITraspasoService _traspasoService;

        public TraspasoController(ITraspasoService traspasoService)
        {
            _traspasoService = traspasoService;
        }

        [HttpPost("aprobar")]
        public async Task<IActionResult> AprobarTraspaso([FromBody] TraspasoRequest request)
        {
            var result = await _traspasoService.TraspasarStockAsync(request.AlmacenOrigenId, request.AlmacenDestinoId, request.ItemId, request.Cantidad, request.EmpleadoId);
            if (result) return Ok(new { success = true });
            return BadRequest(new { success = false, message = "No hay stock suficiente para realizar el traspaso u ocurrió un error." });
        }
    }

    public class TraspasoRequest
    {
        public int AlmacenOrigenId { get; set; }
        public int AlmacenDestinoId { get; set; }
        public int ItemId { get; set; }
        public decimal Cantidad { get; set; }
        public int EmpleadoId { get; set; }
    }
}
