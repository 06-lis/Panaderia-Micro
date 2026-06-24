import sys, pty, os

password = "manzana123\n"
host = "mani@192.168.122.250"

cmd = """
# Install Postfix non-interactively
debconf-set-selections <<< "postfix postfix/mailname string panaderia.local"
debconf-set-selections <<< "postfix postfix/main_mailer_type string 'Internet Site'"
DEBIAN_FRONTEND=noninteractive apt-get install -y postfix dovecot-core dovecot-imapd dovecot-pop3d

# Configure Postfix
postconf -e "home_mailbox = Maildir/"
postconf -e "mailbox_command = "
systemctl restart postfix

# Configure Dovecot for Maildir
sed -i 's|mail_location = mbox:~/mail:INBOX=/var/mail/%u|mail_location = maildir:~/Maildir|' /etc/dovecot/conf.d/10-mail.conf
systemctl restart dovecot
"""

full_cmd = f"echo 'manzana123' | sudo -S bash -c \"{cmd.replace('\"', '\\\"')}\""

pid, fd = pty.fork()
if pid == 0:
    os.execlp("ssh", "ssh", "-o", "StrictHostKeyChecking=no", host, full_cmd)
else:
    output = b""
    while True:
        try:
            data = os.read(fd, 1024)
            output += data
            if b"assword:" in data:
                os.write(fd, password.encode())
        except OSError:
            break
    os.waitpid(pid, 0)
    print(output.decode(errors='ignore'))
