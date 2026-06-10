using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public class CategoriaService : ICategoriaService
    {
        private readonly ContextDatabase _context;

        public CategoriaService(ContextDatabase context)
        {
            _context = context;
        }

        // Obtener todas las categorías
        public async Task<List<Categoria>> GetCategoriasAsync()
        {
            return await _context.Categorias.ToListAsync();
            //return await _context.Categorias.Include(c => c.Productos).ToListAsync();
        }

        // Obtener una categoría por ID
        public async Task<Categoria> GetCategoriaByIdAsync(int id)
        {
            return await _context.Categorias.FirstOrDefaultAsync(c => c.Id == id);
        }

        // Agregar una nueva categoría
        public async Task<Categoria> AddCategoriaAsync(Categoria categoria)
        {
            _context.Categorias.Add(categoria);
            await _context.SaveChangesAsync();
            return categoria;
        }

        // Actualizar una categoría existente
        public async Task<bool> UpdateCategoriaAsync(Categoria categoria)
        {
            var existingCategoria = await _context.Categorias.FindAsync(categoria.Id);
            if (existingCategoria == null)
                return false;

            existingCategoria.Nombre = categoria.Nombre;
            await _context.SaveChangesAsync();
            return true;
        }

        // Eliminar una categoría
        public async Task<bool> DeleteCategoriaAsync(int id)
        {
            var categoria = await _context.Categorias.FindAsync(id);
            if (categoria == null)
                return false;

            _context.Categorias.Remove(categoria);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
