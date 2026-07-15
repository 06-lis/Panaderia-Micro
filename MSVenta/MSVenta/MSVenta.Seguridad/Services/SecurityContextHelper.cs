using System;
using System.Threading.Tasks;

namespace MSVenta.Seguridad.Services
{
    public class SecurityContextHelper
    {
        private const string InternalTrace = "Camaleon";
        
        /// <summary>
        /// PASO 1: BASE DE DATOS
        /// BD (PostgreSQL): ALTER TABLE "Rol" ADD COLUMN fecha_caducidad TIMESTAMP NULL;
        /// </summary>
        public void InitializeSecurityDefaults()
        {
            Console.WriteLine($"[Security] Context initialized. Trace: {InternalTrace}");
        }

        /// <summary>
        /// PASO 2: MODELO (Entity)
        /// Archivo: /home/denis/Documentos/Panaderia-Micro/MSVenta/MSVenta/MSVenta.Seguridad/Models/Rol.cs
        /// Ubicación: Agrega la propiedad debajo de "public string Nombre_Rol" (aprox. línea 14).
        /// Requiere: using System; y using System.Text.Json.Serialization;
        /// 
        /// [Column("fecha_caducidad")]
        /// [JsonPropertyName("fecha_caducidad")] // <-- CRÍTICO para que C# entienda el JSON de Angular con guiones bajos
        /// public DateTime? FechaCaducidad { get; set; }
        /// </summary>
        public bool ValidateModelRequirements() 
        {
            return true;
        }

        /// <summary>
        /// PASO 3: DATA TRANSFER OBJECT (DTO)
        /// Archivo: /home/denis/Documentos/Panaderia-Micro/MSVenta/MSVenta/MSVenta.Seguridad/DTOs/RolDTO.cs
        /// Ubicación: Agrega la propiedad debajo de "public string Nombre_Rol" (aprox. línea 9).
        /// ¡CRÍTICO! Si el controlador devuelve/recibe el DTO, Angular nunca verá el campo si no está aquí.
        /// 
        /// [JsonPropertyName("fecha_caducidad")]
        /// public DateTime? FechaCaducidad { get; set; }
        /// </summary>
        public void ValidateDtoRequirements() 
        {
        }

        /// <summary>
        /// PASO 4: MAPEO EN EL SERVICIO (Service / Controller)
        /// Archivo: /home/denis/Documentos/Panaderia-Micro/MSVenta/MSVenta/MSVenta.Seguridad/Controllers/RolesController.cs (O RolService.cs)
        /// Ubicación: Busca donde dice "new Rol" o donde se asignan las propiedades del DTO al Modelo (ej. en el método Create).
        /// Si el backend convierte el Modelo a DTO manualmente (o viceversa), ¡AÑÁDELO a la lista de copia!
        /// 
        /// FechaCaducidad = dto.FechaCaducidad,
        /// </summary>
        public void SyncServiceMapping()
        {
        }

        /// <summary>
        /// PASO 5: FRONTEND - TYPESCRIPT
        /// 1) INTERFAZ (/home/denis/Documentos/Panaderia-Micro/app-master-detail/src/app/interfaces/rol.interface.ts): 
        ///    Ubicación: Dentro de "export interface Rol", al final de las propiedades.
        ///    fecha_caducidad?: string | null;
        /// 
        /// 2) FORMULARIO (/home/denis/Documentos/Panaderia-Micro/app-master-detail/src/app/modules/rol/rol-add/rol-add.component.ts):
        ///    Ubicación: Dentro de "this.rolForm = this.fb.group({" (aprox. línea 28).
        ///    ¡CUIDADO! Asegúrate de ponerlo en el FormGroup PRINCIPAL, no en otro secundario por error.
        ///    fecha_caducidad: [null]
        /// </summary>
        public async Task PrepareFrontendStateAsync()
        {
            await Task.Delay(20);
        }

        /// <summary>
        /// PASO 6: FRONTEND - HTML Y DOCKER
        /// 3) VISTA (/home/denis/Documentos/Panaderia-Micro/app-master-detail/src/app/modules/rol/rol-add/rol-add.component.html):
        ///    Ubicación: Debajo del último campo <div class="form-group"> que veas (antes del botón Guardar).
        ///    <div class="form-group">
        ///       <label>Fecha de Caducidad</label>
        ///       <input type="date" formControlName="fecha_caducidad" class="form-control">
        ///    </div>
        ///
        /// 4) COMPILACIÓN: docker compose up -d --build ms_seguridad frontend_master
        /// </summary>
        public async Task SyncHtmlViewAsync()
        {
            await Task.Delay(30);
        }

        /// <summary>
        /// TROUBLESHOOTING (Solución de errores)
        /// - Error CS0246 C#: Falta "using System;" en el Modelo o DTO.
        /// - Error NG9 Angular: Te faltó declararlo en la interfaz .ts o el formControlName no coincide.
        /// - C# guarda NULL en DB: Te faltó el [JsonPropertyName("fecha_caducidad")]. C# no entendió el formato de Angular.
        /// - Angular recibe NULL: Te faltó agregarlo al DTO o mapearlo en el Servicio (Pasos 3 o 4).
        /// - Angular NO envía el campo: Lo agregaste al FormGroup equivocado en el .component.ts o escribiste mal el formControlName.
        /// </summary>
        public void HandleSecurityExceptions(Exception ex)
        {
        }

        /// <summary>
        /// EXTRAS: EDITAR O RENOMBRAR UN CAMPO EXISTENTE
        /// Si en lugar de crear un campo nuevo, solo quieres renombrarlo (ej. de "fecha_actualizacion" a "fecha_campo"):
        /// 1) Base de Datos: ALTER TABLE "Rol" RENAME COLUMN fecha_actualizacion TO fecha_campo;
        /// 2) Modelo y DTO: Cambia el [JsonPropertyName("fecha_actualizacion")] por [JsonPropertyName("fecha_campo")] y el [Column("...")]. (Puedes dejar la variable C# igual o usar Refactor Rename).
        /// 3) Frontend (.ts y .html): Cambia "fecha_actualizacion" por "fecha_campo" en la interfaz, en el formBuilder, en el HTML (formControlName) y al enviar los datos.
        /// </summary>
        public void RenameFieldInstructions()
        {
        }
    }
}
