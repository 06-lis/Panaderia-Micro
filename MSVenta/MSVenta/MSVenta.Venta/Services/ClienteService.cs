using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public class ClienteService : IClienteService
    {
        private readonly ContextDatabase _context;

        public ClienteService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Cliente>> GetAllClientes()
        {
            return await _context.Clientes.ToListAsync();
        }

        public async Task<Cliente> GetCliente(int id)
        {
            return await _context.Clientes.FindAsync(id) ?? throw new KeyNotFoundException("Cliente no encontrado.");
        }

        public async Task CreateCliente(Cliente cliente)
        {
            if (cliente == null)
                throw new ArgumentNullException(nameof(cliente), "El cliente no puede ser nulo.");

            _context.Clientes.Add(cliente);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateCliente(Cliente cliente)
        {
            var existingCliente = await _context.Clientes.FindAsync(cliente.Id);
            if (existingCliente == null)
            {
                throw new KeyNotFoundException("Cliente no encontrado.");
            }

            _context.Entry(existingCliente).CurrentValues.SetValues(cliente);
            await _context.SaveChangesAsync();
        }


        public async Task DeleteCliente(int id)
        {
            var cliente = await _context.Clientes.FindAsync(id);
            if (cliente == null)
                throw new KeyNotFoundException("Cliente no encontrado.");

            var ventasAsociadas = await _context.Ventas.AnyAsync(v => v.ClienteId == id);
            if (ventasAsociadas)
                throw new InvalidOperationException("No se puede eliminar el cliente porque tiene ventas registradas.");

            _context.Clientes.Remove(cliente);
            await _context.SaveChangesAsync();
        }
    }
}
