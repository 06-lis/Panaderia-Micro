using Microsoft.AspNetCore.Mvc;
using MSVenta.Produccion.DTOs;
using MSVenta.Produccion.Models;
using MSVenta.Produccion.Services;
using System.Threading.Tasks;

namespace MSVenta.Produccion.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecetaController : ControllerBase
    {
        private readonly IRecetaService _recetaService;

        public RecetaController(IRecetaService recetaService)
        {
            _recetaService = recetaService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _recetaService.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var receta = await _recetaService.GetByIdAsync(id);
            if (receta == null) return NotFound();
            return Ok(receta);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateRecetaDto dto)
        {
            if (dto == null) return BadRequest();

            var receta = new Receta
            {
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion,
                ProductoId = dto.ProductoId,
                CantidadRequerida = dto.CantidadRequerida
            };

            foreach (var detailDto in dto.Detalles)
            {
                receta.Detalles.Add(new DetalleReceta
                {
                    InsumoId = detailDto.InsumoId,
                    CantidadRequerida = detailDto.CantidadRequerida
                });
            }

            var result = await _recetaService.CreateAsync(receta);
            return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Receta receta)
        {
            if (id != receta.Id) return BadRequest("ID mismatch");

            var ok = await _recetaService.UpdateAsync(receta);
            if (!ok) return BadRequest("No se pudo actualizar la receta");

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _recetaService.DeleteAsync(id);
            if (!ok) return NotFound();

            return NoContent();
        }
    }
}
