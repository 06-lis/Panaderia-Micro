using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.Models;

namespace MSVenta.Venta.Repositories
{
    public class ContextDatabase : DbContext
    {
        public ContextDatabase(DbContextOptions<ContextDatabase> options) : base(options) { }

        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Models.Venta> Ventas { get; set; }
        public DbSet<Producto> Productos { get; set; }
        public DbSet<Insumo> Insumos { get; set; }
        public DbSet<Item> Items { get; set; }
        public DbSet<Almacen> Almacenes { get; set; }
        public DbSet<ProductoAlmacen> ProductosAlmacenes { get; set; }
        public DbSet<DetalleVenta> DetallesVenta { get; set; }
        public DbSet<Categoria> Categorias { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Cliente>().ToTable("cliente");
            modelBuilder.Entity<Models.Venta>().ToTable("ventas");
            modelBuilder.Entity<DetalleVenta>().ToTable("detalle_venta");
            modelBuilder.Entity<Categoria>().ToTable("categoria");
            modelBuilder.Entity<Almacen>().ToTable("almacen");

            modelBuilder.Entity<Item>().ToTable("item");
            modelBuilder.Entity<Producto>().ToTable("item");
            modelBuilder.Entity<Insumo>().ToTable("item");

            modelBuilder.Entity<Item>()
                .HasDiscriminator(i => i.Tipo)
                .HasValue<Producto>("Producto")
                .HasValue<Insumo>("Insumo");

            modelBuilder.Entity<Item>()
                .Property(i => i.Tipo)
                .HasColumnName("tipo");

            modelBuilder.Entity<Item>()
                .Property(i => i.UnidadMedida)
                .HasColumnName("unidad_medida");

            modelBuilder.Entity<Item>()
                .Property(i => i.CategoriaId)
                .HasColumnName("categoria_id");

            modelBuilder.Entity<ProductoAlmacen>().ToTable("producto_almacen");
            
            modelBuilder.Entity<ProductoAlmacen>()
                .Property(pa => pa.ItemId)
                .HasColumnName("item_id");

            modelBuilder.Entity<ProductoAlmacen>()
                .HasOne(pa => pa.Item)
                .WithMany()
                .HasForeignKey(pa => pa.ItemId);

            modelBuilder.Entity<ProductoAlmacen>()
                .HasOne(pa => pa.Almacen)
                .WithMany(a => a.ProductosAlmacenes)
                .HasForeignKey(pa => pa.AlmacenId);

            modelBuilder.Entity<DetalleVenta>()
                .HasOne(dv => dv.ProductoAlmacen)
                .WithMany()
                .HasForeignKey(dv => dv.ProductoAlmacenId);

            modelBuilder.Entity<DetalleVenta>()
                .HasOne(dv => dv.Venta)
                .WithMany()
                .HasForeignKey(dv => dv.VentaId);

            modelBuilder.Entity<Models.Venta>()
                .HasOne(v => v.Cliente)
                .WithMany()
                .HasForeignKey(v => v.ClienteId);
        }
    }
}