using System.Collections.Generic;

namespace MSVenta.Seguridad.DTOs
{
    public class RolDTO
    {
        public int ID_Rol { get; set; }
        public string Nombre_Rol { get; set; }
        public List<PermisoDTO> Permisos { get; set; }
    }
}
