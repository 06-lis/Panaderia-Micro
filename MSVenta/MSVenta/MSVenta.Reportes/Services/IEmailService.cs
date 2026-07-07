using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Reportes.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(List<string> toAddresses, string subject, string htmlBody, byte[] attachmentBytes = null, string attachmentName = null);
    }
}
