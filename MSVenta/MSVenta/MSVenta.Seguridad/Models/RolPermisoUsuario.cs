using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MSVenta.Seguridad.Models
{
    public class RolPermisoUsuario
    {
        [Key]
        public int ID_Usuario_Rol_Permiso { get; set; }
        // Relación con Usuario
        public int UserId { get; set; }
        public int ID_Rol_Permiso { get; set; }
        // Relación con RolPermiso
        [JsonIgnore]
        public Usuario Usuario { get; set; }
        [JsonIgnore]
        public RolPermiso RolPermiso { get; set; }

    }
}
