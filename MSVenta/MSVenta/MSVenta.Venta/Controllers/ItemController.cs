using Microsoft.AspNetCore.Mvc;
using MSVenta.Venta.Models;
using MSVenta.Venta.Services;
using System;
using System.Threading.Tasks;

namespace MSVenta.Venta.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemController : ControllerBase
    {
        private readonly IItemService _itemService;

        public ItemController(IItemService itemService)
        {
            _itemService = itemService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _itemService.GetAll());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var item = await _itemService.GetById(id);
                return Ok(item);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateItemDto dto)
        {
            try
            {
                if (dto == null) return BadRequest(new { message = "El cuerpo de la solicitud no puede estar vacío." });

                if (string.IsNullOrEmpty(dto.Nombre))
                    return BadRequest(new { message = "El nombre del item es requerido." });

                if (dto.Tipo.Equals("Producto", StringComparison.OrdinalIgnoreCase))
                {
                    var producto = new Producto
                    {
                        Nombre = dto.Nombre,
                        Precio = dto.Precio,
                        UnidadMedida = dto.UnidadMedida,
                        CategoriaId = dto.CategoriaId,
                        Imagen = dto.Imagen
                    };
                    await _itemService.CreateProducto(producto);
                    return CreatedAtAction(nameof(GetById), new { id = producto.Id }, producto);
                }
                else if (dto.Tipo.Equals("Insumo", StringComparison.OrdinalIgnoreCase))
                {
                    var insumo = new Insumo
                    {
                        Nombre = dto.Nombre,
                        Precio = dto.Precio,
                        UnidadMedida = dto.UnidadMedida,
                        CategoriaId = dto.CategoriaId
                    };
                    await _itemService.CreateInsumo(insumo);
                    return CreatedAtAction(nameof(GetById), new { id = insumo.Id }, insumo);
                }
                else
                {
                    return BadRequest(new { message = "Tipo de item inválido. Debe ser 'Producto' o 'Insumo'." });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocurrió un error interno: " + ex.Message });
            }
        }
    }

    public class CreateItemDto
    {
        public string Nombre { get; set; }
        public double Precio { get; set; }
        public string Tipo { get; set; } // "Producto" o "Insumo"
        public string UnidadMedida { get; set; }
        public int? CategoriaId { get; set; }
        public string Imagen { get; set; }
    }
}
