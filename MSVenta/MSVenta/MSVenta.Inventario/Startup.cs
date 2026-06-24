using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using MSVenta.Inventario.Data;
using Aforo255.Cross.Http.Src;

namespace MSVenta.Inventario
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "MSVenta.Inventario", Version = "v1" });
            });

            var connectionString = Configuration["postgres:connectionString"];
            services.AddDbContext<InventarioDbContext>(options =>
                options.UseNpgsql(connectionString));

            services.AddScoped<MSVenta.Inventario.Services.IInventarioService, MSVenta.Inventario.Services.InventarioService>();
            services.AddScoped<MSVenta.Inventario.Services.IVentaProxyService, MSVenta.Inventario.Services.VentaProxyService>();
            services.AddScoped<MSVenta.Inventario.Services.ITraspasoService, MSVenta.Inventario.Services.TraspasoService>();
            services.AddProxyHttp();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, InventarioDbContext context)
        {
            context.Database.EnsureCreated();
            
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "MSVenta.Inventario v1"));
            }

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
