import sys, pty, os

password = "manzana123\n"
host = "mani@192.168.122.250"

cmd = """
cat << 'ZONE' > /etc/bind/db.panaderia.local
$TTL    604800
@       IN      SOA     ns1.panaderia.local. admin.panaderia.local. (
                              2         ; Serial
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                         604800 )       ; Negative Cache TTL
;
@       IN      NS      ns1.panaderia.local.
@       IN      A       192.168.122.250
ns1     IN      A       192.168.122.250
mail    IN      A       192.168.122.250
www     IN      A       192.168.122.250
@       IN      MX      10 mail.panaderia.local.
ZONE

echo 'zone "panaderia.local" {
    type master;
    file "/etc/bind/db.panaderia.local";
};' >> /etc/bind/named.conf.local

systemctl restart bind9
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
