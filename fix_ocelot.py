import re

path = '/home/denis/Documentos/Panaderia-Micro/MSVenta/MSVenta/MSVenta.Gateway/ocelot.json'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

new_lines = []
for i in range(len(lines)):
    line = lines[i]
    if '"Host": "localhost"' in line:
        # peek at next line
        if i + 1 < len(lines):
            next_line = lines[i+1]
            if '5001' in next_line:
                line = line.replace('"localhost"', '"ms_seguridad"')
            elif '5002' in next_line:
                line = line.replace('"localhost"', '"ms_venta"')
            elif '5003' in next_line:
                line = line.replace('"localhost"', '"ms_compras"')
            elif '5004' in next_line:
                line = line.replace('"localhost"', '"ms_produccion"')
            elif '5005' in next_line:
                line = line.replace('"localhost"', '"ms_inventario"')
            elif '5006' in next_line:
                line = line.replace('"localhost"', '"ms_reportes"')
    
    if '"Port": 500' in line:
        line = re.sub(r'500[1-6]', '80', line)

    if '"AllowedOrigins"' in line:
        line = '      "AllowedOrigins": [ "*" ],\n'
        
    new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
