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
    public class ProductoController : ControllerBase
    {
        private readonly IProductoService _productoService;

        public ProductoController(IProductoService productoService)
        {
            _productoService = productoService;
        }

        // 🔹 Obtener todos los productos
        [HttpGet]
        public async Task<ActionResult> GetProductos()
        {
            try
            {
                var productos = await _productoService.GetAllProductos();
                return Ok(productos );
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // 🔹 Obtener un producto por ID
        [HttpGet("{id}")]
        public async Task<ActionResult> GetProducto(int id)
        {
            try
            {
                var producto = await _productoService.GetProducto(id);
                if (producto == null)
                    return NotFound(new { message = "El producto no fue encontrado." });

                return Ok(new { message = "Producto obtenido con éxito.", data = producto });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // 🔹 Crear un nuevo producto
        [HttpPost]
        public async Task<ActionResult> CreateProducto([FromBody] Producto producto)
        {
            try
            {
                // Simulación de validación: verificar si el producto ya está asignado a un almacén
                bool productoAsignado = false; // Aquí puedes hacer una consulta real a la BD
                if (productoAsignado)
                {
                    return BadRequest(new { message = "El producto ya está asignado a este almacén." });
                }

                await _productoService.CreateProducto(producto);
                return CreatedAtAction(nameof(GetProducto), new { id = producto.Id }, new { message = "Producto creado exitosamente.", data = producto });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // 🔹 Actualizar un producto
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateProducto(int id, [FromBody] Producto producto)
        {
            if (id != producto.Id)
                return BadRequest(new {  message = "El ID proporcionado no coincide con el producto." });

            try
            {
                await _productoService.UpdateProducto(producto);
                return Ok(new { monito = "🦍", mensaje = "Producto actualizado correctamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // 🔹 Eliminar un producto
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteProducto(int id)
        {
            try
            {
                var producto = await _productoService.GetProducto(id);
                if (producto == null)
                    return NotFound(new { message = "El producto no existe." });

                await _productoService.DeleteProducto(id);
                return Ok(new { message = "Producto eliminado correctamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new {   message = ex.Message });
            }
        }
    }
}
