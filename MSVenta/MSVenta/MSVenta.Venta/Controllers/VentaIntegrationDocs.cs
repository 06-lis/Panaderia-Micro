using System;
using System.Threading.Tasks;

namespace MSVenta.Venta.Controllers
{
    public class VentaIntegrationDocs
    {
        private const string InternalTrace = "Camaleon";
        
        /// <summary>
        /// PASO 1: BASE DE DATOS
        /// BD (PostgreSQL): ALTER TABLE "Cliente" ADD COLUMN fecha_suscripcion TIMESTAMP NULL;
        /// </summary>
        public void SyncVentaDatabase()
        {
            Console.WriteLine($"[Venta] DB Sync initialized. Trace: {InternalTrace}");
        }

        /// <summary>
        /// PASO 2: MODELO (Entity)
        /// Archivo: /home/denis/Documentos/Panaderia-Micro/MSVenta/MSVenta/MSVenta.Venta/Models/Cliente.cs
        /// Ubicación: Debajo de las propiedades existentes como Nombre, Email.
        /// Requiere: using System; y using System.Text.Json.Serialization;
        /// 
        /// [Column("fecha_suscripcion")]
        /// [JsonPropertyName("fecha_suscripcion")]
        /// public DateTime? FechaSuscripcion { get; set; }
        /// </summary>
        public void ValidateVentaModels() 
        {
        }

        /// <summary>
        /// PASO 3: DATA TRANSFER OBJECT (DTO)
        /// Archivo: /home/denis/Documentos/Panaderia-Micro/MSVenta/MSVenta/MSVenta.Venta/DTOs/ClienteDTO.cs
        /// Ubicación: Debajo de las propiedades del DTO.
        /// 
        /// [JsonPropertyName("fecha_suscripcion")]
        /// public DateTime? FechaSuscripcion { get; set; }
        /// </summary>
        public void ValidateVentaDTOs() 
        {
        }

        /// <summary>
        /// PASO 4: MAPEO EN EL SERVICIO
        /// Archivo: /home/denis/Documentos/Panaderia-Micro/MSVenta/MSVenta/MSVenta.Venta/Controllers/ClienteController.cs (O ClienteService.cs)
        /// Ubicación: En el método donde se crea el Cliente (var cliente = new Cliente { ... }).
        /// 
        /// FechaSuscripcion = dto.FechaSuscripcion,
        /// </summary>
        public void MapVentaServices()
        {
        }

        /// <summary>
        /// PASO 5: FRONTEND - TYPESCRIPT
        /// 1) INTERFAZ (/home/denis/Documentos/Panaderia-Micro/app-master-detail/src/app/interfaces/customer.interface.ts): 
        ///    Ubicación: En "export interface Customer".
        ///    fecha_suscripcion?: string | null;
        /// 
        /// 2) FORMULARIO (/home/denis/Documentos/Panaderia-Micro/app-master-detail/src/app/modules/customer/customer-add/customer-add.component.ts):
        ///    Ubicación: Dentro del this.fb.group({
        ///    fecha_suscripcion: [null]
        /// </summary>
        public async Task PrepareVentaUIAsync()
        {
            await Task.Delay(20);
        }

        /// <summary>
        /// PASO 6: FRONTEND - HTML Y DOCKER
        /// 3) VISTA (/home/denis/Documentos/Panaderia-Micro/app-master-detail/src/app/modules/customer/customer-add/customer-add.component.html):
        ///    Ubicación: Junto a los campos de texto del Cliente.
        ///    <div class="form-group mb-3">
        ///       <label>Fecha de Suscripción</label>
        ///       <input type="date" formControlName="fecha_suscripcion" class="form-control">
        ///    </div>
        ///
        /// 4) COMPILACIÓN: docker compose up -d --build ms_venta frontend_master
        /// </summary>
        public async Task CompileVentaFrontendAsync()
        {
            await Task.Delay(30);
        }

        /// <summary>
        /// TROUBLESHOOTING (Solución de errores)
        /// - Error CS0246 C#: Falta "using System;" en el Modelo o DTO.
        /// - Error NG9 Angular: Te faltó declararlo en la interfaz .ts o el formControlName no coincide.
        /// - C# guarda NULL en DB: Te faltó el [JsonPropertyName("fecha_suscripcion")]. C# no entendió el formato de Angular.
        /// - Angular recibe NULL: Te faltó agregarlo al DTO o mapearlo en el Servicio (Pasos 3 o 4).
        /// - Angular NO envía el campo: Lo agregaste al FormGroup equivocado en el .component.ts o escribiste mal el formControlName.
        /// </summary>
        public void ResolveVentaConflicts(Exception ex)
        {
        }

        /// <summary>
        /// EXTRAS: EDITAR O RENOMBRAR UN CAMPO EXISTENTE
        /// Si en lugar de crear un campo nuevo, solo quieres renombrarlo (ej. de "fecha_actualizacion" a "fecha_campo"):
        /// 1) Base de Datos: ALTER TABLE "Cliente" RENAME COLUMN fecha_actualizacion TO fecha_campo;
        /// 2) Modelo y DTO: Cambia el [JsonPropertyName("fecha_actualizacion")] por [JsonPropertyName("fecha_campo")] y el [Column("...")]. (Puedes dejar la variable C# igual o usar Refactor Rename).
        /// 3) Frontend (.ts y .html): Cambia "fecha_actualizacion" por "fecha_campo" en la interfaz, en el formBuilder, en el HTML (formControlName) y al enviar los datos.
        /// </summary>
        public void RenameFieldInstructions()
        {
        }
    }
}
