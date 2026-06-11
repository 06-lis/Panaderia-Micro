using Microsoft.EntityFrameworkCore;
using MSVenta.Produccion.Models;
using MSVenta.Produccion.Repositories;
using System.Collections.Generic;
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
            _context.Entry(receta).State = EntityState.Modified;
            foreach (var detail in receta.Detalles)
            {
                if (detail.Id == 0)
                {
                    detail.RecetaId = receta.Id;
                    await _context.DetallesReceta.AddAsync(detail);
                }
                else
                {
                    _context.Entry(detail).State = EntityState.Modified;
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
