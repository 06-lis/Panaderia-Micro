using Microsoft.AspNetCore.Mvc;
using MSVenta.Venta.Models;
using MSVenta.Venta.Services;
using System.Collections.Generic;
using System;
using System.Threading.Tasks;

namespace MSVenta.Venta.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClienteController : Controller
    {
        private readonly IClienteService _clienteService;

        public ClienteController(IClienteService clienteService)
        {
            _clienteService = clienteService;
        }

        // Obtener todos los clientes
        [HttpGet]
        public async Task<IActionResult> GetAllClientes()
        {
            var clientes = await _clienteService.GetAllClientes();
            return Ok(clientes);
        }

        // Obtener un cliente por ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCliente(int id)
        {
            var cliente = await _clienteService.GetCliente(id);
            if (cliente == null)
            {
                return NotFound(new { message = "Cliente no encontrado." });
            }
            return Ok(cliente);
        }

        // Crear un nuevo cliente
        [HttpPost]
        public async Task<IActionResult> CreateCliente([FromBody] Cliente cliente)
        {
            if (cliente == null)
            {
                return BadRequest(new { message = "Los datos del cliente son inválidos." });
            }

            await _clienteService.CreateCliente(cliente);
            return CreatedAtAction(nameof(GetCliente), new { id = cliente.Id }, cliente);
        }

        // Actualizar un cliente
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCliente(int id, [FromBody] Cliente cliente)
        {
            if (cliente == null || id != cliente.Id)
            {
                return BadRequest(new { message = "Datos inválidos o IDs no coinciden." });
            }

            try
            {
                await _clienteService.UpdateCliente(cliente);
                return Ok(new { message = "Cliente actualizado correctamente." });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Cliente no encontrado." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor.", error = ex.Message });
            }
        }

        // Eliminar un cliente
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCliente(int id)
        {
            try
            {
                await _clienteService.DeleteCliente(id);
                return Ok(new { message = "Cliente eliminado correctamente." });
            }
            catch (InvalidOperationException)
            {
                return BadRequest(new { message = "No se puede eliminar este cliente porque está vinculado a otras transacciones." });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Cliente no encontrado." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor.", error = ex.Message });
            }
        }
    }
}
