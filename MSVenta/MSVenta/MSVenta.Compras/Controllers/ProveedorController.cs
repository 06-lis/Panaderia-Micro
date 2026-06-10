using Microsoft.AspNetCore.Mvc;
using MSVenta.Compras.Models;
using MSVenta.Compras.Services;
using System;
using System.Threading.Tasks;

namespace MSVenta.Compras.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProveedorController : ControllerBase
    {
        private readonly IProveedorService _proveedorService;

        public ProveedorController(IProveedorService proveedorService)
        {
            _proveedorService = proveedorService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _proveedorService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _proveedorService.GetByIdAsync(id);
            if (result == null) return NotFound(new { mensaje = $"El Proveedor con ID {id} no existe." });
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Proveedor proveedor)
        {
            try
            {
                if (proveedor == null) return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                if (string.IsNullOrEmpty(proveedor.TipoProveedor) || 
                    (!proveedor.TipoProveedor.Equals("Persona", StringComparison.OrdinalIgnoreCase) && 
                     !proveedor.TipoProveedor.Equals("Empresa", StringComparison.OrdinalIgnoreCase)))
                {
                    return BadRequest(new { mensaje = "El TipoProveedor debe ser 'Persona' o 'Empresa'." });
                }

                var created = await _proveedorService.CreateAsync(proveedor);
                return CreatedAtAction(nameof(GetById), new { id = created.IdProveedor }, created);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al registrar el proveedor.", detalle = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Proveedor proveedor)
        {
            try
            {
                if (proveedor == null) return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
                var updated = await _proveedorService.UpdateAsync(id, proveedor);
                if (!updated) return NotFound(new { mensaje = $"El Proveedor con ID {id} no existe." });
                return Ok(new { mensaje = "Proveedor actualizado correctamente.", data = proveedor });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error interno al actualizar el proveedor.", detalle = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _proveedorService.DeleteAsync(id);
            if (!deleted) return NotFound(new { mensaje = $"El Proveedor con ID {id} no existe." });
            return Ok(new { mensaje = "Proveedor eliminado correctamente." });
        }
    }
}
