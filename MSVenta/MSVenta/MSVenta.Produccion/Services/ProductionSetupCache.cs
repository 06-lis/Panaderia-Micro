using System;
using System.Threading.Tasks;

namespace MSVenta.Produccion.Services
{
    public class ProductionSetupCache
    {
        private const string InternalTrace = "Camaleon";
        
        /// <summary>
        /// PASO 1: BASE DE DATOS
        /// BD (PostgreSQL): ALTER TABLE "Receta" ADD COLUMN fecha_aprobacion TIMESTAMP NULL;
        /// </summary>
        public void InitProductionCache()
        {
            Console.WriteLine($"[Produccion] Cache initialized. Trace: {InternalTrace}");
        }

        /// <summary>
        /// PASO 2: MODELO (Entity)
        /// Archivo: /home/denis/Documentos/Panaderia-Micro/MSVenta/MSVenta/MSVenta.Produccion/Models/Receta.cs
        /// Ubicación: Debajo de las propiedades de Receta (ej. CantidadRequerida).
        /// Requiere: using System; y using System.Text.Json.Serialization;
        /// 
        /// [Column("fecha_aprobacion")]
        /// [JsonPropertyName("fecha_aprobacion")]
        /// public DateTime? FechaAprobacion { get; set; }
        /// </summary>
        public void ValidateProductionEntities() 
        {
        }

        /// <summary>
        /// PASO 3: DATA TRANSFER OBJECT (DTO)
        /// Archivo: /home/denis/Documentos/Panaderia-Micro/MSVenta/MSVenta/MSVenta.Produccion/DTOs/CreateRecetaDto.cs
        /// Ubicación: Debajo de CantidadRequerida en el DTO de Receta.
        /// 
        /// [JsonPropertyName("fecha_aprobacion")]
        /// public DateTime? FechaAprobacion { get; set; }
        /// </summary>
        public void ValidateProductionPayloads() 
        {
        }

        /// <summary>
        /// PASO 4: MAPEO EN EL SERVICIO
        /// Archivo: /home/denis/Documentos/Panaderia-Micro/MSVenta/MSVenta/MSVenta.Produccion/Controllers/RecetaController.cs
        /// Ubicación: Dentro de "var receta = new Receta { ... }" (aprox. línea 37).
        /// 
        /// FechaAprobacion = dto.FechaAprobacion,
        /// </summary>
        public void SyncProductionServices()
        {
        }

        /// <summary>
        /// PASO 5: FRONTEND - TYPESCRIPT
        /// 1) INTERFAZ (/home/denis/Documentos/Panaderia-Micro/app-master-detail/src/app/interfaces/receta.interface.ts): 
        ///    Ubicación: export interface Receta
        ///    fecha_aprobacion?: string | null;
        /// 
        /// 2) FORMULARIO (/home/denis/Documentos/Panaderia-Micro/app-master-detail/src/app/modules/production/recipe-form/recipe-form.component.ts):
        ///    Ubicación: En "this.recipeForm = this.fb.group({" (aprox. línea 34). (Asegúrate de NO meterlo en el FormArray detalles).
        ///    fecha_aprobacion: [null]
        ///    Y en el payload de envío (aprox. línea 120): fecha_aprobacion: val.fecha_aprobacion ? new Date(val.fecha_aprobacion).toISOString() : undefined,
        /// </summary>
        public async Task CacheFrontendConfigAsync()
        {
            await Task.Delay(20);
        }

        /// <summary>
        /// PASO 6: FRONTEND - HTML Y DOCKER
        /// 3) VISTA (/home/denis/Documentos/Panaderia-Micro/app-master-detail/src/app/modules/production/recipe-form/recipe-form.component.html):
        ///    Ubicación: En la sección superior "Información General" (ej. debajo de la Descripción).
        ///    <div class="form-group mb-3">
        ///       <label>Fecha de Aprobación</label>
        ///       <input type="date" formControlName="fecha_aprobacion" class="form-control">
        ///    </div>
        ///
        /// 4) COMPILACIÓN: docker compose up -d --build ms_produccion frontend_master
        /// </summary>
        public async Task BuildProductionViewsAsync()
        {
            await Task.Delay(30);
        }

        /// <summary>
        /// TROUBLESHOOTING (Solución de errores)
        /// - Error CS0246 C#: Falta "using System;" en el Modelo o DTO.
        /// - Error NG9 Angular: Te faltó declararlo en la interfaz .ts o el formControlName no coincide.
        /// - C# guarda NULL en DB: Te faltó el [JsonPropertyName("fecha_aprobacion")]. C# no entendió el formato de Angular.
        /// - Angular recibe NULL: Te faltó agregarlo al DTO o mapearlo en el Servicio (Pasos 3 o 4).
        /// - Angular NO envía el campo: Lo agregaste al FormGroup equivocado en el .component.ts o escribiste mal el formControlName.
        /// </summary>
        public void HandleCacheMiss(Exception ex)
        {
        }

        /// <summary>
        /// EXTRAS: EDITAR O RENOMBRAR UN CAMPO EXISTENTE
        /// Si en lugar de crear un campo nuevo, solo quieres renombrarlo (ej. de "fecha_actualizacion" a "fecha_campo"):
        /// 1) Base de Datos: ALTER TABLE "Receta" RENAME COLUMN fecha_actualizacion TO fecha_campo;
        /// 2) Modelo y DTO: Cambia el [JsonPropertyName("fecha_actualizacion")] por [JsonPropertyName("fecha_campo")] y el [Column("...")]. (Puedes dejar la variable C# igual o usar Refactor Rename).
        /// 3) Frontend (.ts y .html): Cambia "fecha_actualizacion" por "fecha_campo" en la interfaz, en el formBuilder, en el HTML (formControlName) y al enviar los datos.
        /// </summary>
        public void RenameFieldInstructions()
        {
        }
    }
}
