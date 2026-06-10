using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Aforo255.Cross.Http.Src;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;
using MSVenta.Compras.Repositories;
using MSVenta.Compras.Services;

namespace MSVenta.Compras
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "MSVenta.Compras", Version = "v1" });
            });

            // Registrar MongoDB Client y Base de datos
            var connectionString = Configuration["mongo:connectionString"];
            var databaseName = Configuration["mongo:databaseName"];
            var mongoClient = new MongoClient(connectionString);
            var mongoDatabase = mongoClient.GetDatabase(databaseName);
            services.AddSingleton<IMongoClient>(mongoClient);
            services.AddSingleton(mongoDatabase);
            services.AddSingleton<MongoContext>();

            // Registrar proxy HTTP
            services.AddProxyHttp();

            // Registrar servicios de negocio
            services.AddScoped<ISeguridadService, SeguridadService>();
            services.AddScoped<IVentaService, VentaService>();
            services.AddScoped<IProveedorService, ProveedorService>();
            services.AddScoped<ICompraService, CompraService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "MSVenta.Compras v1"));
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
