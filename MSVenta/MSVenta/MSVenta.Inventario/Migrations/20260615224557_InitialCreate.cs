using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace MSVenta.Inventario.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "configuracion_inventario",
                columns: table => new
                {
                    clave = table.Column<string>(type: "text", nullable: false),
                    valor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_configuracion_inventario", x => x.clave);
                });

            migrationBuilder.CreateTable(
                name: "lotes_inventario",
                columns: table => new
                {
                    id_lote = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_almacen = table.Column<int>(type: "integer", nullable: false),
                    id_item = table.Column<int>(type: "integer", nullable: false),
                    cantidad_inicial = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    cantidad_disponible = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    precio_unitario = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    fecha_entrada = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    fecha_salida = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    fecha_vencimiento = table.Column<DateTime>(type: "date", nullable: true),
                    metodo_valuacion = table.Column<string>(type: "text", nullable: true),
                    estado = table.Column<string>(type: "text", nullable: true),
                    referencia_id = table.Column<int>(type: "integer", nullable: true),
                    referencia_tipo = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_lotes_inventario", x => x.id_lote);
                });

            migrationBuilder.CreateTable(
                name: "movimientos_inventario",
                columns: table => new
                {
                    id_movimiento = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_lote = table.Column<int>(type: "integer", nullable: true),
                    id_almacen = table.Column<int>(type: "integer", nullable: false),
                    id_item = table.Column<int>(type: "integer", nullable: false),
                    tipo_movimiento = table.Column<string>(type: "text", nullable: true),
                    cantidad = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    costo_unitario = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    costo_total = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    fecha_movimiento = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    id_empleado = table.Column<int>(type: "integer", nullable: true),
                    referencia_id = table.Column<int>(type: "integer", nullable: true),
                    referencia_tipo = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_movimientos_inventario", x => x.id_movimiento);
                });

            migrationBuilder.CreateTable(
                name: "traspasos",
                columns: table => new
                {
                    id_traspaso = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_almacen_origen = table.Column<int>(type: "integer", nullable: false),
                    id_almacen_destino = table.Column<int>(type: "integer", nullable: false),
                    id_empleado = table.Column<int>(type: "integer", nullable: false),
                    fecha_solicitud = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    fecha_aprobacion = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    estado = table.Column<string>(type: "text", nullable: true),
                    observaciones = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_traspasos", x => x.id_traspaso);
                });

            migrationBuilder.CreateTable(
                name: "traspasos_almacen_item",
                columns: table => new
                {
                    id_traspaso_item = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_traspaso = table.Column<int>(type: "integer", nullable: false),
                    id_item = table.Column<int>(type: "integer", nullable: false),
                    cantidad = table.Column<decimal>(type: "numeric(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_traspasos_almacen_item", x => x.id_traspaso_item);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "configuracion_inventario");

            migrationBuilder.DropTable(
                name: "lotes_inventario");

            migrationBuilder.DropTable(
                name: "movimientos_inventario");

            migrationBuilder.DropTable(
                name: "traspasos");

            migrationBuilder.DropTable(
                name: "traspasos_almacen_item");
        }
    }
}
