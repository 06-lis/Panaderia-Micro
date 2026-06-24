import sys, pty, os

password = "manzana123\n"
host = "mani@192.168.122.250"

cmd = """
# Install Apache, PHP, MariaDB
DEBIAN_FRONTEND=noninteractive apt-get install -y apache2 php libapache2-mod-php mariadb-server php-mysql php-mbstring php-intl php-xml php-gd php-curl php-zip

# Enable Apache modules
a2enmod rewrite
systemctl restart apache2

# Setup Database for Roundcube
mysql -e "CREATE DATABASE IF NOT EXISTS roundcubemail /*!40101 CHARACTER SET utf8 COLLATE utf8_general_ci */;"
mysql -e "CREATE USER IF NOT EXISTS 'roundcube'@'localhost' IDENTIFIED BY 'roundcube_pass';"
mysql -e "GRANT ALL PRIVILEGES ON roundcubemail.* TO 'roundcube'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Create basic index.html to test
echo "<h1>Bienvenido al servidor de Panaderia</h1>" > /var/www/html/index.html
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
