import re
import sys
import os

path = r'E:\Proyecto-Tec\MSVenta\MSVenta\MSVenta.Gateway\ocelot.json'
mode = sys.argv[1].lower() if len(sys.argv) > 1 else 'local'

if not os.path.exists(path):
    print(f"Error: {path} not found.")
    sys.exit(1)

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

mappings = {
    'ms_seguridad': 5001,
    'ms_venta': 5002,
    'ms_compras': 5003,
    'ms_produccion': 5004,
    'ms_inventario': 5005,
    'ms_reportes': 5006
}

if mode == 'local':
    for host, port in mappings.items():
        pattern = re.compile(rf'"Host"\s*:\s*"{host}"\s*,\s*"Port"\s*:\s*80', re.IGNORECASE)
        replacement = f'"Host": "localhost",\n          "Port": {port}'
        content = pattern.sub(replacement, content)
    print("Switched to LOCAL mode in ocelot.json")
elif mode == 'docker':
    for host, port in mappings.items():
        pattern = re.compile(rf'"Host"\s*:\s*"localhost"\s*,\s*"Port"\s*:\s*{port}', re.IGNORECASE)
        replacement = f'"Host": "{host}",\n          "Port": 80'
        content = pattern.sub(replacement, content)
    print("Switched to DOCKER mode in ocelot.json")
else:
    print("Invalid mode. Use 'local' or 'docker'.")
    sys.exit(1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
