using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using MSVenta.Inventario.Services;

namespace MSVenta.Inventario.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventarioController : ControllerBase
    {
        private readonly IInventarioService _inventarioService;

        public InventarioController(IInventarioService inventarioService)
        {
            _inventarioService = inventarioService;
        }

        [HttpPost("ingreso")]
        public async Task<IActionResult> IngresoStock([FromBody] IngresoRequest request)
        {
            var result = await _inventarioService.IngresoStockAsync(request.AlmacenId, request.ItemId, request.Cantidad, request.CostoUnitario, request.EmpleadoId, request.FechaVencimiento);
            if (result) return Ok(new { success = true });
            return BadRequest(new { success = false, message = "No se pudo registrar el ingreso." });
        }

        [HttpPost("consumo")]
        public async Task<IActionResult> ConsumoStock([FromBody] ConsumoRequest request)
        {
            var result = await _inventarioService.ConsumoStockAsync(request.AlmacenId, request.ItemId, request.Cantidad, request.EmpleadoId);
            if (result) return Ok(new { success = true });
            return BadRequest(new { success = false, message = "No hay stock suficiente para realizar el consumo." });
        }

        [HttpGet("lotes")]
        public async Task<IActionResult> GetLotes()
        {
            return Ok(await _inventarioService.GetLotesAsync());
        }

        [HttpGet("movimientos")]
        public async Task<IActionResult> GetMovimientos()
        {
            return Ok(await _inventarioService.GetMovimientosAsync());
        }

        [HttpGet("productoalmacen/stock/{itemId}/{almacenId}")]
        public async Task<IActionResult> GetStockFromLotes(int itemId, int almacenId)
        {
            var lotes = await _inventarioService.GetLotesAsync();
            var sum = System.Linq.Enumerable.Sum(
                System.Linq.Enumerable.Where(System.Linq.Enumerable.Cast<dynamic>(lotes), l => l.id_item == itemId && l.id_almacen == almacenId), 
                l => (decimal)l.cantidad_disponible
            );
            return Ok(new { ItemId = itemId, AlmacenId = almacenId, Stock = sum });
        }

        [HttpGet("traspasos")]
        public async Task<IActionResult> GetTraspasos()
        {
            return Ok(await _inventarioService.GetTraspasosAsync());
        }

        [HttpPost("traspasos")]
        public async Task<IActionResult> RegistrarTraspaso([FromBody] RegistrarTraspasoRequest req)
        {
            var res = await _inventarioService.RegistrarTraspasoAsync(req.LoteId, req.AlmacenOrigenId, req.AlmacenDestinoId, req.Cantidad, req.Motivo, req.UsuarioSolicitaId);
            if (res) return Ok(new { success = true });
            return BadRequest(new { success = false, message = "Error al registrar traspaso." });
        }

        [HttpGet("configuracion")]
        public async Task<IActionResult> GetConfiguracion()
        {
            return Ok(await _inventarioService.GetConfiguracionAsync());
        }

        [HttpPost("configuracion")]
        public async Task<IActionResult> UpdateConfiguracion([FromBody] object config)
        {
            var res = await _inventarioService.UpdateConfiguracionAsync(config);
            if (res) return Ok(new { success = true });
            return BadRequest(new { success = false });
        }
    }

    public class IngresoRequest
    {
        public int AlmacenId { get; set; }
        public int ItemId { get; set; }
        public decimal Cantidad { get; set; }
        public decimal CostoUnitario { get; set; }
        public int EmpleadoId { get; set; }
        public System.DateTime? FechaVencimiento { get; set; }
    }

    public class ConsumoRequest
    {
        public int AlmacenId { get; set; }
        public int ItemId { get; set; }
        public decimal Cantidad { get; set; }
        public int EmpleadoId { get; set; }
    }
    public class RegistrarTraspasoRequest
    {
        public int LoteId { get; set; }
        public int AlmacenOrigenId { get; set; }
        public int AlmacenDestinoId { get; set; }
        public decimal Cantidad { get; set; }
        public string Motivo { get; set; }
        public int UsuarioSolicitaId { get; set; }
    }
}
