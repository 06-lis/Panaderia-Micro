using Microsoft.AspNetCore.Mvc;
using MSVenta.Venta.Models;
using MSVenta.Venta.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductoAlmacenController : Controller
    {
        private readonly ProductoAlmacenService _productoAlmacenService;

        public ProductoAlmacenController(ProductoAlmacenService productoAlmacenService)
        {
            _productoAlmacenService = productoAlmacenService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductoAlmacen>>> GetAll()
        {
            return Ok(await _productoAlmacenService.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductoAlmacen>> GetById(int id)
        {
            var productoAlmacen = await _productoAlmacenService.GetByIdAsync(id);
            if (productoAlmacen == null)
                return NotFound();
            return Ok(productoAlmacen);
        }

        [HttpPost]
        public async Task<ActionResult<ProductoAlmacen>> AsignarProductoAlmacen(ProductoAlmacen productoAlmacen)
        {

            try
            {
                var nuevoProductoAlmacen = await _productoAlmacenService.AddAsync(productoAlmacen);
                return CreatedAtAction(nameof(AsignarProductoAlmacen), new { id = nuevoProductoAlmacen.Id }, nuevoProductoAlmacen);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { mensaje = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno del servidor.", detalle = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ProductoAlmacen productoAlmacen)
        {
            if (id != productoAlmacen.Id)
                return BadRequest("ID mismatch");

            var updated = await _productoAlmacenService.UpdateAsync(productoAlmacen);
            if (!updated)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _productoAlmacenService.DeleteAsync(id);
            if (!deleted)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{productoId}/{almacenId}")]
        public async Task<IActionResult> QuitarProductoDeAlmacen(int productoId, int almacenId)
        {
            try
            {
                bool result = await _productoAlmacenService.QuitarProductoDeAlmacenAsync(productoId, almacenId);

                if (result)
                {
                    return Ok(new { message = "Producto eliminado del almacén con éxito." });
                }
                else
                {
                    return NotFound(new { message = "El producto no existe en este almacén." });
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message }); // Mensaje de parámetros inválidos
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message }); // Mensaje de producto o almacén no encontrado
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message }); // Mensaje de operación inválida (producto en uso)
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocurrió un error inesperado: " + ex.Message }); // Mensaje de error inesperado
            }
        }

    }
}
