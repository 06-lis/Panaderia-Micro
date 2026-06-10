using Microsoft.AspNetCore.Mvc;
using MSVenta.Venta.Models;
using MSVenta.Venta.Services;
using System.Threading.Tasks;

namespace MSVenta.Venta.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AlmacenController : Controller
    {
        private readonly IAlmecenService _almacenService;

        public AlmacenController(IAlmecenService almacenService) => _almacenService = almacenService;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _almacenService.GetAllAlmacenesAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id) => Ok(await _almacenService.GetAlmacenByIdAsync(id));

        [HttpPost]
        public async Task<IActionResult> Create(Almacen almacen)
        {
            await _almacenService.CreateAlmacen(almacen);
            return CreatedAtAction(nameof(Get), new { id = almacen.Id }, almacen);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Almacen almacen)
        {
            if (id != almacen.Id) return BadRequest();
            await _almacenService.UpdateAlmacen(almacen);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _almacenService.DeleteAlmacen(id);
            return NoContent();
        }
    }
}
