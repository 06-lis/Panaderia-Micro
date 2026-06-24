using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MSVenta.Venta.Models
{
    [Table("transacciones_libelula")]
    public class TransaccionLibelula
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [Column("VentaId")]
        public int VentaId { get; set; }

        [Required]
        [Column("Identificador")]
        public string Identificador { get; set; }

        [Column("IdTransaccionLibelula")]
        public string IdTransaccionLibelula { get; set; }

        [Column("CodigoRecaudacion")]
        public string CodigoRecaudacion { get; set; }

        [Required]
        [Column("Monto")]
        public double Monto { get; set; }

        [Column("Estado")]
        public string Estado { get; set; }

        [Column("QrUrl")]
        public string QrUrl { get; set; }

        [Column("UrlPasarela")]
        public string UrlPasarela { get; set; }

        [Column("RespuestaApi")]
        public string RespuestaApi { get; set; }

        [Column("FechaRegistro")]
        public DateTime? FechaRegistro { get; set; }

        [JsonIgnore]
        [ForeignKey("VentaId")]
        public virtual Venta Venta { get; set; }
    }
}
