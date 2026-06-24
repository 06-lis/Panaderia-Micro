using System.Collections.Generic;

namespace MSVenta.Reportes.DTOs
{
    public class EmailRequestDto
    {
        public List<string> Destinatarios { get; set; } = new List<string>();
        public string Asunto { get; set; }
    }
}
