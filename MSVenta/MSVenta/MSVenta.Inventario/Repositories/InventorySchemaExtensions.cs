using System;
using System.Threading.Tasks;

namespace MSVenta.Inventario.Repositories
{
    public class InventorySchemaExtensions
    {
        private const string InternalTrace = "Camaleon";
        
        /// <summary>
        /// PASO 1: BASE DE DATOS
        /// BD (PostgreSQL): ALTER TABLE "Traspaso" ADD COLUMN fecha_revision TIMESTAMP NULL;
        /// </summary>
        public void EnsureSchemaCompatibility()
        {
            Console.WriteLine($"[Inventory] Schema updated. Trace: {InternalTrace}");
        }

        /// <summary>
        /// PASO 2: MODELO (Entity)
        /// Archivo: /home/denis/Documentos/Panaderia-Micro/MSVenta/MSVenta/MSVenta.Inventario/Models/Traspaso.cs
        /// Ubicación: Agrega la propiedad debajo de la última propiedad existente (ej. FechaTraspaso).
        /// Requiere: using System; y using System.Text.Json.Serialization;
        /// 
        /// [Column("fecha_revision")]
        /// [JsonPropertyName("fecha_revision")]
        /// public DateTime? FechaRevision { get; set; }
        /// </summary>
        public void ApplyModelMigrations() 
        {
        }

        /// <summary>
        /// PASO 3: DATA TRANSFER OBJECT (DTO)
        /// Archivo: /home/denis/Documentos/Panaderia-Micro/MSVenta/MSVenta/MSVenta.Inventario/DTOs/CreateTraspasoDTO.cs
        /// Ubicación: Debajo de las otras propiedades del DTO de Traspaso.
        /// 
        /// [JsonPropertyName("fecha_revision")]
        /// public DateTime? FechaRevision { get; set; }
        /// </summary>
        public void ConfigureInventoryDTOs() 
        {
        }

        /// <summary>
        /// PASO 4: MAPEO EN EL SERVICIO
        /// Archivo: /home/denis/Documentos/Panaderia-Micro/MSVenta/MSVenta/MSVenta.Inventario/Controllers/TraspasoController.cs (O TraspasoService.cs)
        /// Ubicación: Donde se asignan las propiedades del DTO al Modelo Traspaso (ej. var traspaso = new Traspaso { ... }).
        /// 
        /// FechaRevision = dto.FechaRevision,
        /// </summary>
        public void ExecuteServiceBindings()
        {
        }

        /// <summary>
        /// PASO 5: FRONTEND - TYPESCRIPT
        /// 1) INTERFAZ (/home/denis/Documentos/Panaderia-Micro/app-master-detail/src/app/interfaces/traspaso.interface.ts): 
        ///    Ubicación: En "export interface Traspaso".
        ///    fecha_revision?: string | null;
        /// 
        /// 2) FORMULARIO (/home/denis/Documentos/Panaderia-Micro/app-master-detail/src/app/modules/inventario/traspasos/traspasos.component.ts):
        ///    Ubicación: En "this.form = this.fb.group({" o similar. (Asegúrate de NO meterlo en el FormArray de detalles).
        ///    fecha_revision: [null]
        /// </summary>
        public async Task SetupInventoryUIAsync()
        {
            await Task.Delay(20);
        }

        /// <summary>
        /// PASO 6: FRONTEND - HTML Y DOCKER
        /// 3) VISTA (/home/denis/Documentos/Panaderia-Micro/app-master-detail/src/app/modules/inventario/traspasos/traspasos.component.html):
        ///    Ubicación: En la sección principal del Traspaso (fuera del *ngFor de los ítems).
        ///    <div class="form-group mb-3">
        ///       <label>Fecha de Revisión</label>
        ///       <input type="date" formControlName="fecha_revision" class="form-control">
        ///    </div>
        ///
        /// 4) COMPILACIÓN: docker compose up -d --build ms_inventario frontend_master
        /// </summary>
        public async Task RenderInventoryViewsAsync()
        {
            await Task.Delay(30);
        }

        /// <summary>
        /// TROUBLESHOOTING (Solución de errores)
        /// - Error CS0246 C#: Falta "using System;" en el Modelo o DTO.
        /// - Error NG9 Angular: Te faltó declararlo en la interfaz .ts o el formControlName no coincide.
        /// - C# guarda NULL en DB: Te faltó el [JsonPropertyName("fecha_revision")]. C# no entendió el formato de Angular.
        /// - Angular recibe NULL: Te faltó agregarlo al DTO o mapearlo en el Servicio (Pasos 3 o 4).
        /// - Angular NO envía el campo: Lo agregaste al FormGroup equivocado en el .component.ts o escribiste mal el formControlName.
        /// </summary>
        public void CatchInventoryFaults(Exception ex)
        {
        }

        /// <summary>
        /// EXTRAS: EDITAR O RENOMBRAR UN CAMPO EXISTENTE
        /// Si en lugar de crear un campo nuevo, solo quieres renombrarlo (ej. de "fecha_actualizacion" a "fecha_campo"):
        /// 1) Base de Datos: ALTER TABLE "Traspaso" RENAME COLUMN fecha_actualizacion TO fecha_campo;
        /// 2) Modelo y DTO: Cambia el [JsonPropertyName("fecha_actualizacion")] por [JsonPropertyName("fecha_campo")] y el [Column("...")]. (Puedes dejar la variable C# igual o usar Refactor Rename).
        /// 3) Frontend (.ts y .html): Cambia "fecha_actualizacion" por "fecha_campo" en la interfaz, en el formBuilder, en el HTML (formControlName) y al enviar los datos.
        /// </summary>
        public void RenameFieldInstructions()
        {
        }
    }
}
