using Microsoft.EntityFrameworkCore;
using MSVenta.Produccion.Models;
using MSVenta.Produccion.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Produccion.Services
{
    public class RecetaService : IRecetaService
    {
        private readonly ContextDatabase _context;

        public RecetaService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Receta>> GetAllAsync()
        {
            return await _context.Recetas
                .Include(r => r.Detalles)
                .ToListAsync();
        }

        public async Task<Receta> GetByIdAsync(int id)
        {
            return await _context.Recetas
                .Include(r => r.Detalles)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<Receta> CreateAsync(Receta receta)
        {
            await _context.Recetas.AddAsync(receta);
            await _context.SaveChangesAsync();
            return receta;
        }

        public async Task<bool> UpdateAsync(Receta receta)
        {
            var existingReceta = await _context.Recetas
                .Include(r => r.Detalles)
                .FirstOrDefaultAsync(r => r.Id == receta.Id);

            if (existingReceta == null) return false;

            // Update main recipe properties
            _context.Entry(existingReceta).CurrentValues.SetValues(receta);

            // Remove deleted details
            foreach (var existingDetail in existingReceta.Detalles.ToList())
            {
                if (!receta.Detalles.Any(d => d.Id == existingDetail.Id))
                {
                    _context.DetallesReceta.Remove(existingDetail);
                }
            }

            // Update existing details and add new details
            foreach (var detail in receta.Detalles)
            {
                var existingDetail = existingReceta.Detalles.FirstOrDefault(d => d.Id == detail.Id);
                if (existingDetail != null)
                {
                    // Update
                    _context.Entry(existingDetail).CurrentValues.SetValues(detail);
                }
                else
                {
                    // Insert
                    detail.RecetaId = receta.Id;
                    existingReceta.Detalles.Add(detail);
                }
            }

            try
            {
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var receta = await _context.Recetas.FindAsync(id);
            if (receta == null) return false;

            _context.Recetas.Remove(receta);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
