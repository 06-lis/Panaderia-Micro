using Microsoft.EntityFrameworkCore;
using MSVenta.Inventario.Models;

namespace MSVenta.Inventario.Data
{
    public class InventarioDbContext : DbContext
    {
        public InventarioDbContext(DbContextOptions<InventarioDbContext> options) : base(options)
        {
        }

        public DbSet<LoteInventario> LotesInventario { get; set; }
        public DbSet<MovimientoInventario> MovimientosInventario { get; set; }
        public DbSet<Traspaso> Traspasos { get; set; }
        public DbSet<TraspasoAlmacenItem> TraspasosAlmacenItem { get; set; }
        public DbSet<ConfiguracionInventario> ConfiguracionesInventario { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
    }
}
