using Microsoft.AspNetCore.Mvc;
using MSVenta.Venta.Models;
using MSVenta.Venta.Services;
using System.Threading.Tasks;
using System;

namespace MSVenta.Venta.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DetalleVentaController : Controller
    {
        private readonly IDetalleVentaService _detalleService;

        public DetalleVentaController(IDetalleVentaService detalleService) => _detalleService = detalleService;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _detalleService.GetAllDetalles());

        
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id) => Ok(await _detalleService.GetDetallesPorVenta(id));
        //public async Task<IActionResult> Get(int id) => Ok(await _detalleService.GetDetalle(id));

        [HttpPost]
        public async Task<IActionResult> Create(DetalleVenta detalle)
        {
            try
            {
                await _detalleService.CreateDetalle(detalle);
                return CreatedAtAction(nameof(Get), new { id = detalle.Id }, detalle);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, DetalleVenta detalle)
        {
            if (id != detalle.Id) return BadRequest();
            await _detalleService.UpdateDetalle(detalle);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _detalleService.DeleteDetalle(id);
            return NoContent();
        }
        public IActionResult Index()
        {
            return View();
        }
    }
}
