using MSVenta.Seguridad.DTOs;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MSVenta.Seguridad.Models
{
    public class RolPermiso
    {
        [Key]
        [Column("ID_Rol_Permiso")]
        public int ID_Rol_Permiso { get; set; }
        [Column("ID_Rol")]
        public int ID_Rol { get; set; }
        [Column("ID_Permiso")]
        public int ID_Permiso { get; set; }
        [JsonIgnore]
        public Rol Rol { get; set; }
        [JsonIgnore]
        public Permiso Permiso { get; set; }
        [JsonIgnore]
        public ICollection<RolPermisoUsuario> RolPermisoUsuarios { get; set; }

    }
}
