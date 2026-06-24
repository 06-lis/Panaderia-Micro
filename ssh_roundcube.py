import sys, pty, os

password = "manzana123\n"
host = "mani@192.168.122.250"

cmd = """
# Download and install Roundcube
cd /tmp
wget -q https://github.com/roundcube/roundcubemail/releases/download/1.6.9/roundcubemail-1.6.9-complete.tar.gz
tar -xzf roundcubemail-1.6.9-complete.tar.gz
mv roundcubemail-1.6.9 /var/www/html/roundcube
chown -R www-data:www-data /var/www/html/roundcube

# Import database schema
mysql roundcubemail < /var/www/html/roundcube/SQL/mysql.initial.sql

# Create configuration file
cp /var/www/html/roundcube/config/config.inc.php.sample /var/www/html/roundcube/config/config.inc.php
sed -i "s|mysql://roundcube:pass@localhost/roundcubemail|mysql://roundcube:roundcube_pass@localhost/roundcubemail|" /var/www/html/roundcube/config/config.inc.php

# Enable IMAP/SMTP in config (Roundcube 1.6+ default is auto, but let's be sure)
echo "\\$config['default_host'] = 'localhost';" >> /var/www/html/roundcube/config/config.inc.php
echo "\\$config['smtp_server'] = 'localhost';" >> /var/www/html/roundcube/config/config.inc.php

# Delete installer
rm -rf /var/www/html/roundcube/installer
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
