FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /src

# Copiar solución y proyectos para restaurar paquetes NuGet ("nuggets") primero
COPY ["MSVenta.sln", "./"]
COPY ["MSVenta.Compras/MSVenta.Compras.csproj", "MSVenta.Compras/"]
COPY ["MSVenta.Gateway/MSVenta.Gateway.csproj", "MSVenta.Gateway/"]
COPY ["MSVenta.Inventario/MSVenta.Inventario.csproj", "MSVenta.Inventario/"]
COPY ["MSVenta.Produccion/MSVenta.Produccion.csproj", "MSVenta.Produccion/"]
COPY ["MSVenta.Reportes/MSVenta.Reportes.csproj", "MSVenta.Reportes/"]
COPY ["MSVenta.Seguridad/MSVenta.Seguridad.csproj", "MSVenta.Seguridad/"]
COPY ["MSVenta.Venta/MSVenta.Venta.csproj", "MSVenta.Venta/"]

# Restaurar paquetes NuGet de toda la solución
RUN dotnet restore "MSVenta.sln"

# Copiar el resto del código fuente
COPY . .

# Argumento para saber qué proyecto construir
ARG PROJECT_NAME
WORKDIR "/src/${PROJECT_NAME}"

# Compilar
RUN dotnet build "${PROJECT_NAME}.csproj" -c Release -o /app/build

FROM build AS publish
ARG PROJECT_NAME
RUN dotnet publish "${PROJECT_NAME}.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Usar variable de entorno para ejecutar dinámicamente el proyecto que corresponda
ARG PROJECT_NAME
ENV DLL_NAME=${PROJECT_NAME}.dll
ENTRYPOINT ["sh", "-c", "dotnet $DLL_NAME"]
