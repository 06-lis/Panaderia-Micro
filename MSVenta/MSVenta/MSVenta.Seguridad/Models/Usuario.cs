using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MSVenta.Seguridad.Models
{
    public class Usuario
    {
        [Key]
        public int UserId { get; set; }
        public string Fullname { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }

        [Column("id_empleado")]
        public int? IdEmpleado { get; set; }

        [Column("id_cliente")]
        public int? IdCliente { get; set; }

        [Column("fecha_actualizacion")]
        [JsonPropertyName("fecha_actualizacion")]
        public DateTime? FechaActualizacion { get; set; }
        
        // Navigation property for Empleado
        [ForeignKey("IdEmpleado")]
        public Empleado Empleado { get; set; }

        public ICollection<RolPermisoUsuario> RolPermisoUsuarios { get; set; }
    }
}
