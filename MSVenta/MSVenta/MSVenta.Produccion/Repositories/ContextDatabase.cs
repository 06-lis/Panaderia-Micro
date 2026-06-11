using Microsoft.EntityFrameworkCore;
using MSVenta.Produccion.Models;

namespace MSVenta.Produccion.Repositories
{
    public class ContextDatabase : DbContext
    {
        public ContextDatabase(DbContextOptions<ContextDatabase> options) : base(options) { }

        public DbSet<Receta> Recetas { get; set; }
        public DbSet<DetalleReceta> DetallesReceta { get; set; }
        public DbSet<Models.Produccion> Producciones { get; set; }
        public DbSet<DetalleProduccion> DetallesProduccion { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Receta>().ToTable("recetas");
            modelBuilder.Entity<DetalleReceta>().ToTable("detalle_receta");
            modelBuilder.Entity<Models.Produccion>().ToTable("producciones");
            modelBuilder.Entity<DetalleProduccion>().ToTable("detalle_produccion");

            modelBuilder.Entity<Receta>()
                .HasKey(r => r.Id);

            modelBuilder.Entity<DetalleReceta>()
                .HasKey(dr => dr.Id);

            modelBuilder.Entity<DetalleReceta>()
                .HasOne(dr => dr.Receta)
                .WithMany(r => r.Detalles)
                .HasForeignKey(dr => dr.RecetaId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Models.Produccion>()
                .HasKey(p => p.Id);

            modelBuilder.Entity<DetalleProduccion>()
                .HasKey(dp => dp.Id);

            modelBuilder.Entity<DetalleProduccion>()
                .HasOne(dp => dp.Produccion)
                .WithMany(p => p.Detalles)
                .HasForeignKey(dp => dp.ProduccionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DetalleProduccion>()
                .HasOne(dp => dp.DetalleReceta)
                .WithMany()
                .HasForeignKey(dp => dp.DetalleRecetaId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
