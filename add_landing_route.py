import json

path = '/home/denis/Documentos/Panaderia-Micro/MSVenta/MSVenta/MSVenta.Gateway/ocelot.json'
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_route = {
    "DownstreamPathTemplate": "/api/landing/{everything}",
    "DownstreamScheme": "http",
    "DownstreamHostAndPorts": [
        {
            "Host": "ms_venta",
            "Port": 80
        }
    ],
    "UpstreamPathTemplate": "/api/landing/{everything}",
    "UpstreamHttpMethod": [ "Get", "Post", "Put", "Delete", "Options" ]
}

# Check if it exists
exists = False
for route in data.get("Routes", []):
    if route.get("UpstreamPathTemplate") == "/api/landing/{everything}":
        exists = True
        break

if not exists:
    if "Routes" not in data:
        data["Routes"] = []
    data["Routes"].append(new_route)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print("Route added successfully")
else:
    print("Route already exists")
