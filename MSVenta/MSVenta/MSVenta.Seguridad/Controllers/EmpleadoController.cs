using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MSVenta.Seguridad.Models;
using MSVenta.Seguridad.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Seguridad.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmpleadoController : Controller
    {
        private readonly IEmpleadoService _empleadoService;

        public EmpleadoController(IEmpleadoService empleadoService)
        {
            _empleadoService = empleadoService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Empleado>>> GetEmpleados()
        {
            var empleados = await _empleadoService.GetAllEmpleados();
            return Ok(empleados);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Empleado>> GetEmpleado(int id)
        {
            var empleado = await _empleadoService.GetEmpleadoById(id);
            return empleado == null ? NotFound() : Ok(empleado);
        }

        [HttpPost]
        public async Task<ActionResult<Empleado>> CreateEmpleado(Empleado empleado)
        {
            var createdEmpleado = await _empleadoService.CreateEmpleado(empleado);
            return CreatedAtAction(nameof(GetEmpleado), new { id = createdEmpleado.IdEmpleado }, createdEmpleado);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmpleado(int id, Empleado empleado)
        {
            if (id != empleado.IdEmpleado) return BadRequest();

            try
            {
                await _empleadoService.UpdateEmpleado(empleado);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await EmpleadoExists(id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmpleado(int id)
        {
            await _empleadoService.DeleteEmpleado(id);
            return NoContent();
        }

        private async Task<bool> EmpleadoExists(int id)
        {
            return await _empleadoService.GetEmpleadoById(id) != null;
        }
    }
}
