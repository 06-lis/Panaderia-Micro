using Microsoft.EntityFrameworkCore;
using MSVenta.Seguridad.Models;
using MSVenta.Seguridad.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Seguridad.Services
{
    public class EmpleadoService : IEmpleadoService
    {
        private readonly ContextDatabase _context;

        public EmpleadoService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Empleado>> GetAllEmpleados()
        {
            return await _context.Empleados.ToListAsync();
        }

        public async Task<Empleado> GetEmpleadoById(int id)
        {
            return await _context.Empleados.FindAsync(id);
        }

        public async Task<Empleado> CreateEmpleado(Empleado empleado)
        {
            _context.Empleados.Add(empleado);
            await _context.SaveChangesAsync();
            return empleado;
        }

        public async Task UpdateEmpleado(Empleado empleado)
        {
            _context.Entry(empleado).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteEmpleado(int id)
        {
            var empleado = await _context.Empleados.FindAsync(id);
            if (empleado != null)
            {
                _context.Empleados.Remove(empleado);
                await _context.SaveChangesAsync();
            }
        }
    }
}
