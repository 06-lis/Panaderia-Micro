using Aforo255.Cross.Http.Src;
using Aforo255.Cross.Token.Src;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MSVenta.Venta.Repositories;
using MSVenta.Venta.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Venta
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
            services.AddDbContext<ContextDatabase>(
               opt =>
               {
                   opt.UseMySQL(Configuration["mysql:cn"]);
               });
            services.AddScoped<IClienteService, ClienteService>();
            services.AddScoped<IVentaService, VentaService>();
            services.AddScoped<IProductoService, ProductoService>();
            services.AddScoped<IItemService, ItemService>();
            services.AddScoped<IAlmecenService, AlmacenService>();
            services.AddScoped<IDetalleVentaService, DetalleVentaService>();
            services.AddScoped<ProductoAlmacenService>();
            services.AddScoped<ICategoriaService, CategoriaService>();

            services.AddProxyHttp();
            services.AddScoped<IUsuarioService, UsuarioService>();



        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
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
