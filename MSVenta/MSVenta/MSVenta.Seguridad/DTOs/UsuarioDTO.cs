using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace MSVenta.Seguridad.DTOs
{
    public class UsuarioDTO
    {
        public int UserId { get; set; }
        public string Fullname { get; set; }
        public string Username { get; set; }
        public int? IdEmpleado { get; set; }
        public int? IdCliente { get; set; }
        [JsonPropertyName("fecha_actualizacion")]
        public DateTime? FechaActualizacion { get; set; }
        public List<RolDTO> Roles { get; set; }
    }
}
