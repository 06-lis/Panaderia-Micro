using System.Collections.Generic;

namespace MSVenta.Reportes.DTOs
{
    public class EmailRequestDto
    {
        public List<string> Destinatarios { get; set; } = new List<string>();
        public string Asunto { get; set; }
        public string Base64Pdf { get; set; }
        public System.DateTime? StartDate { get; set; }
        public System.DateTime? EndDate { get; set; }
    }
}
