using Aforo255.Cross.Http.Src;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using MSVenta.Produccion.Repositories;
using MSVenta.Produccion.Services;

namespace MSVenta.Produccion
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
            
            // Configurar SQL Server con Entity Framework Core
            services.AddDbContext<ContextDatabase>(opt =>
            {
                opt.UseSqlServer(Configuration["sqlserver:cn"]);
            });

            // Registrar proxy HTTP
            services.AddProxyHttp();

            // Registrar servicios de integración
            services.AddScoped<IVentaService, VentaService>();
            services.AddScoped<ISeguridadService, SeguridadService>();

            // Registrar servicios de negocio
            services.AddScoped<IRecetaService, RecetaService>();
            services.AddScoped<IProduccionService, ProduccionService>();

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "MSVenta.Produccion", Version = "v1" });
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "MSVenta.Produccion v1"));
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
