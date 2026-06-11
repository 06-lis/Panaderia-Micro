using Microsoft.AspNetCore.Mvc;
using MSVenta.Produccion.DTOs;
using MSVenta.Produccion.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Produccion.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProduccionController : ControllerBase
    {
        private readonly IProduccionService _produccionService;

        public ProduccionController(IProduccionService produccionService)
        {
            _produccionService = produccionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _produccionService.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var result = await _produccionService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost("solicitar")]
        public async Task<IActionResult> Solicitar(CreateProduccionDto dto)
        {
            try
            {
                var result = await _produccionService.SolicitarProduccionAsync(dto);
                return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Mensaje = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Mensaje = "Ocurrió un error inesperado al solicitar producción.", Detalle = ex.Message });
            }
        }

        [HttpPost("aprobar/{id}")]
        public async Task<IActionResult> Aprobar(int id, AprobarProduccionDto dto)
        {
            try
            {
                var result = await _produccionService.AprobarProduccionAsync(id, dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Mensaje = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Mensaje = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Mensaje = "Ocurrió un error inesperado al aprobar la producción.", Detalle = ex.Message });
            }
        }

        [HttpPost("rechazar/{id}")]
        public async Task<IActionResult> Rechazar(int id)
        {
            try
            {
                var ok = await _produccionService.RechazarProduccionAsync(id);
                if (!ok) return NotFound();
                return Ok(new { Mensaje = "Producción rechazada correctamente." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Mensaje = "Ocurrió un error inesperado al rechazar la producción.", Detalle = ex.Message });
            }
        }
    }
}
