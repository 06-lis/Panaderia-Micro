using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Gateway
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.ConfigureAppConfiguration((hostingContext, config) =>
                    {
                        var env = hostingContext.HostingEnvironment;
                        if (env.IsDevelopment() && System.IO.File.Exists("ocelot.Development.json"))
                        {
                            config.AddJsonFile("ocelot.Development.json", optional: false, reloadOnChange: true);
                        }
                        else
                        {
                            config.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);
                        }
                    });
                    webBuilder.UseStartup<Startup>();
                });
    }
}
