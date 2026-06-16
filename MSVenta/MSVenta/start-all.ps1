$services = @(
    "MSVenta.Gateway",
    "MSVenta.Seguridad",
    "MSVenta.Inventario",
    "MSVenta.Venta",
    "MSVenta.Compras",
    "MSVenta.Produccion",
    "MSVenta.Reportes"
)

Write-Host "Iniciando todos los microservicios de Panaderia..." -ForegroundColor Cyan

foreach ($service in $services) {
    Write-Host "Iniciando $service..." -ForegroundColor Yellow
    # Start-Process lanza una nueva ventana de consola independiente para cada microservicio
    Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "cd $service; dotnet run"
}

Write-Host "Todos los servicios han sido lanzados en ventanas separadas." -ForegroundColor Green
