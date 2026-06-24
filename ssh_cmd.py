import sys, pty, os, time

password = "manzana123\n"
host = "mani@192.168.122.250"
cmd = " ".join(sys.argv[1:])

pid, fd = pty.fork()
if pid == 0:
    # Child process
    os.execlp("ssh", "ssh", "-o", "StrictHostKeyChecking=no", host, cmd)
else:
    # Parent process
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
