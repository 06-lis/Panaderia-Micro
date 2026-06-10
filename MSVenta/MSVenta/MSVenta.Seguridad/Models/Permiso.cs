using System.Collections.Generic;
using System;
using System.ComponentModel.DataAnnotations;
using MSVenta.Seguridad.DTOs; // Añade este using


namespace MSVenta.Seguridad.Models
{
    public class Permiso
    {
        [Key]
        public int ID_Permiso { get; set; }
        public string Nombre_Permiso { get; set; }
        public string Descripcion { get; set; }
        public DateTime Fecha_Creacion { get; set; }
        public ICollection<RolPermiso> RolPermisos { get; set; }

        //internal object Select(Func<object, PermisoDTO> value)
        //{
        //    throw new NotImplementedException();
        //}
    }
}
