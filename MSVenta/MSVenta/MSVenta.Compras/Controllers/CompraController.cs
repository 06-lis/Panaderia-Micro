using Microsoft.AspNetCore.Mvc;
using MSVenta.Compras.Models;
using MSVenta.Compras.Services;
using System;
using System.Threading.Tasks;

namespace MSVenta.Compras.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CompraController : ControllerBase
    {
        private readonly ICompraService _compraService;

        public CompraController(ICompraService compraService)
        {
            _compraService = compraService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _compraService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _compraService.GetByIdAsync(id);
            if (result == null) return NotFound(new { mensaje = $"La Nota de Compra con ID {id} no existe." });
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] NotaCompra compra)
        {
            try
            {
                if (compra == null) return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                if (compra.Detalles == null || compra.Detalles.Count == 0)
                {
                    return BadRequest(new { mensaje = "La compra debe incluir al menos un detalle de compra." });
                }

                var created = await _compraService.CreateAsync(compra);
                return CreatedAtAction(nameof(GetById), new { id = created.IdNotaCompra }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al procesar la compra.", detalle = ex.Message });
            }
        }
    }
}
