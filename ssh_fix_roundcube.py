import sys, pty, os

password = "manzana123\n"
host = "mani@192.168.122.250"

cmd = """
sed -i "s|\\['default_host'\\] = 'localhost';|\\$config['default_host'] = 'localhost';|" /var/www/html/roundcube/config/config.inc.php
sed -i "s|\\['smtp_server'\\] = 'localhost';|\\$config['smtp_server'] = 'localhost';|" /var/www/html/roundcube/config/config.inc.php
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
