using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Aforo255.Cross.Token.Src;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MSVenta.Seguridad.Repositories;
using MSVenta.Seguridad.Services;

namespace MSVenta.Seguridad
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
            services.AddDbContext<ContextDatabase>(
               opt =>
               {
                   opt.UseNpgsql(Configuration["postgresql:cn"]);
               });

            services.AddScoped<IPermisoService, PermisoService>();
            services.AddScoped<IRolPermisoService, RolPermisoService>();
            services.AddScoped<IRolPermisoUsuarioService, RolPermisoUsuarioService>();
            services.AddScoped<IRolService, RolService>();
            services.AddScoped<IUsuarioService, UsuarioService>();
            services.AddScoped<IEmpleadoService, EmpleadoService>();
            
            services.Configure<JwtOptions>(Configuration.GetSection("jwt"));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ContextDatabase context)
        {
            context.Database.EnsureCreated();

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

/*
1. Encender el Servidor de Microservicios (Docker)
Tus microservicios y bases de datos están configurados en la carpeta Panaderia-Micro. Para encenderlos todos en segundo plano, ejecuta:

bash


cd /home/denis/Documentos/Panaderia-Micro
docker compose up -d
(Si quieres ver los logs en vivo para saber si falló alguno, quítale el -d al final).

2. Encender el Servidor de Correo
Dependiendo de cuál estés usando ahora, tienes dos opciones:

Opción A: El correo en tu nueva Máquina Virtual (Ubuntu Server) Si te refieres a la máquina virtual manita que configuramos recientemente, los servicios de correo (Postfix y Dovecot) se encienden automáticamente cada vez que arrancas la máquina virtual en KVM. Si por alguna razón se apagaron mientras la máquina estaba encendida, puedes reiniciarlos entrando por SSH:

bash


ssh mani@192.168.122.250
sudo systemctl restart postfix dovecot
Opción B: El correo en Docker (El antiguo docker-mailserver) Si sigues usando la versión de Docker que tenías configurada en tu otra carpeta, debes navegar a ese directorio y levantar el contenedor:

bash


cd /home/denis/Documentos/panaderia-otto/deploy
docker compose -f docker-compose-mail.yml up -d
(Recuerda que si encendiste tu máquina virtual y al mismo tiempo tienes el Docker de correo encendido, podrían chocar si intentan usar el mismo puerto local en tu red, así que es recomendable usar solo uno a la vez).


ALTER TABLE "Empleado" ADD COLUMN sexo VARCHAR(20) NULL;

Forma Manual (Rápida): Como solo es un campo, vas al archivo /Models/Empleado.cs y escribes a mano la propiedad exacta que creaste en la base de datos:
csharp


[Column("sexo")]
public string? Sexo { get; set; }


3. Actualizar la Capa de Transferencia (Opcional pero común)
Si tu API no expone el modelo Empleado directamente sino que usa DTOs (Data Transfer Objects), debes agregar la misma propiedad en esa clase.

Vas al archivo respectivo (ej. EmpleadoDTO.cs) y agregas: public string? Sexo { get; set; }

4. Capa de Modelo FrontEnd (Angular - TypeScript)
En tu proyecto Angular, debes ir al archivo donde esté definida la interfaz o clase de tu Empleado (por ejemplo, empleado.model.ts o empleado.interface.ts). Debes agregarle el campo nullable:

typescript


export interface Empleado {
  idEmpleado: number;
  nombre: string;
  // ... otros campos
  sexo?: string | null;  // El "?" significa que es opcional/nullable
}


control en el formulario HTML (por ejemplo, en empleado-form.component.html). Lo más normal para el "sexo" sería un menú desplegable (Select) atado al modelo (usando ngModel si es un formulario basado en plantillas, o formControlName si usas Formularios Reactivos):

Ejemplo con Formularios Reactivos:

html


<label for="sexo">Sexo</label>
<select id="sexo" formControlName="sexo">
   <option [ngValue]="null">Seleccione...</option>
   <option value="M">Masculino</option>
   <option value="F">Femenino</option>
</select>



1. Entrar a la Máquina Virtual
Abre la terminal en tu Linux Mint y conéctate:

bash


ssh mani@192.168.122.250
2. Editar los archivos del DNS
El DNS en Ubuntu se divide en dos archivos principales. Elige el que necesites editar según lo que quieras lograr:

Archivo A: Zonas (Si quieres cambiar el nombre del dominio principal) Aquí es donde le dices al DNS qué dominios maneja (por ejemplo, panaderia.local).

bash


sudo nano /etc/bind/named.conf.local
Archivo B: Registros (Si quieres apuntar subdominios a ciertas IPs) Este es el archivo más importante. Aquí están los registros A, MX, NS. Aquí es donde dices "quiero que mail.panaderia.local apunte a la IP 192.168.122.250".

bash


sudo nano /etc/bind/db.panaderia.local
(Guarda los cambios en nano presionando Ctrl+O, luego Enter, y sal con Ctrl+X).

3. Aplicar los cambios
Cada vez que modifiques cualquiera de esos dos archivos, debes reiniciar el servicio DNS para que los cambios surtan efecto inmediatamente:

bash


sudo systemctl restart bind9



sudo nano /etc/postfix/main.cf
(Si alguna vez quieres cambiar el dominio de los correos, ahí buscarías la línea mydestination y myhostname).

Para aplicar los cambios:

bash


sudo systemctl restart postfix
2. Dovecot (El servidor IMAP/POP3)
Dovecot tiene su configuración dividida en varios archivos pequeños dentro de una carpeta. El archivo más importante, donde le indicas en qué formato y en qué carpeta de tu Ubuntu se van a guardar los correos físicos, es:

bash


sudo nano /etc/dovecot/conf.d/10-mail.conf
(También existen otros archivos ahí mismo como 10-auth.conf para la autenticación de usuarios).

Para aplicar los cambios:

bash


sudo systemctl restart dovecot
3. Webmail (Roundcube)
Si en el futuro necesitas editar la configuración visual del webmail, o cambiar la contraseña de su base de datos, el archivo está en los archivos de tu servidor web (Apache):

bash


sudo nano /var/www/html/roundcube/config/config.inc.php


Abre tu terminal y genera el archivo de migración ejecutando este comando de Docker (cambia tu_atributo y tu_tabla):
bash


docker exec panaderia_php php artisan make:migration add_tu_atributo_to_tu_tabla_table --table=tu_tabla
Ve a la carpeta database/migrations/ en tu editor de código y abre el archivo recién creado (es el último de la lista).
Añade tu campo dentro de la función up(). Por ejemplo:
php


public function up()
{
    Schema::table('tu_tabla', function (Blueprint $table) {
        // Ejemplo: agregando un campo de texto después de otra columna
        $table->string('tu_atributo', 50)->nullable()->after('columna_existente');
    });
}
(Nota: Si prefieres hacerlo manualmente en DBeaver usando código SQL como platicamos antes, puedes saltarte este paso 1 y simplemente correr tu ALTER TABLE).

Paso 2: El Modelo
Laravel necesita saber que este nuevo atributo tiene permiso para ser guardado masivamente.

Abre el modelo correspondiente, por ejemplo app/Models/TuModelo.php.
Busca la variable protected $fillable = [...] y agrega el nombre de tu nuevo atributo a la lista:
php


protected $fillable = [
    'columna_existente_1',
    'columna_existente_2',
    'tu_atributo', // <-- Tu nuevo campo agregado aquí
];
Paso 3: El Controlador (La Lógica)
Ahora debes decirle al servidor web cómo recibir, validar y guardar la información de ese campo cuando se envíe un formulario.

Abre tu controlador, por ejemplo app/Http/Controllers/TuControlador.php.
Busca la función store() (que crea nuevos registros) y la función update() (que edita registros).
Agrega tu atributo a las reglas de validación en ambas funciones:
php


$request->validate([
    'columna_existente_1' => 'required',
    'tu_atributo'         => 'required|string|max:50', // <-- Validación
]);
Paso 4: La Vista (Frontend)
Finalmente, necesitas que el usuario pueda interactuar con el campo en la interfaz.

Abre tus archivos .blade.php donde estén tus formularios (generalmente el de creación y el de edición).
Agrega el código HTML para tu cuadro de texto (input), selector (select) o casilla (checkbox). Asegúrate de que el name="tu_atributo" coincida exactamente con el nombre de tu base de datos:
html


<div class="form-group">
    <label>Mi Nuevo Atributo</label>
    <input type="text" name="tu_atributo" class="form-control" required>
</div>
Paso 5: Aplicar en Docker y Recargar el Servidor (¡Muy Importante!)
Una vez que hayas guardado todos los archivos anteriores, debes decirle a tu contenedor Docker que aplique los cambios y limpie la memoria caché para que no te muestre versiones viejas.

Abre tu terminal y ejecuta en orden:

Corre la migración en la base de datos (si usaste el Paso 1):
bash


docker exec panaderia_php php artisan migrate
Limpia absolutamente toda la caché de Laravel (Modelos, Vistas y Configuración) dentro de Docker:
bash


docker exec panaderia_php php artisan optimize:clear
Refresca tu Navegador Web: Ve a tu navegador y presiona Ctrl + F5 (o Cmd + Shift + R en Mac). Esto fuerza al navegador a ignorar su propia caché y descargar el nuevo código HTML (tu nuevo cuadro de texto) directamente desde tu servidor Docker.

*/