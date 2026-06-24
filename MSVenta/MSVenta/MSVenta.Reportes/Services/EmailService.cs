using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using MSVenta.Reportes.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSVenta.Reportes.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailConfig _config;

        public EmailService(IOptions<EmailConfig> config)
        {
            _config = config.Value;
        }

        public async Task SendEmailAsync(List<string> toAddresses, string subject, string htmlBody)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_config.FromName ?? "Panaderia Otto", _config.FromAddress));
            
            foreach (var to in toAddresses)
            {
                message.To.Add(MailboxAddress.Parse(to));
            }

            message.Subject = subject;

            var bodyBuilder = new BodyBuilder { HtmlBody = htmlBody };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            
            // Connect without SSL first for local networking
            await client.ConnectAsync(_config.Host, _config.Port, SecureSocketOptions.Auto);

            if (!string.IsNullOrEmpty(_config.Username) && !string.IsNullOrEmpty(_config.Password))
            {
                await client.AuthenticateAsync(_config.Username, _config.Password);
            }

            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}
