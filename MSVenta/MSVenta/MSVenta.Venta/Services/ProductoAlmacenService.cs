using Microsoft.EntityFrameworkCore;
using MSVenta.Venta.DTOs;
using MSVenta.Venta.Models;
using MSVenta.Venta.Repositories;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MSVenta.Venta.Services
{
    public class ProductoAlmacenService
    {
        private readonly ContextDatabase _context;

        public ProductoAlmacenService(ContextDatabase context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProductoAlmacen>> GetAllAsync()
        {
            return await _context.ProductosAlmacenes
                .Include(pa => pa.Item)
                    .ThenInclude(c => c.Categoria)
                .Include(pa => pa.Almacen)
                .ToListAsync();

        }

        public async Task<ProductoAlmacen> GetByIdAsync(int id)
        {
            return await _context.ProductosAlmacenes
                .Include(pa => pa.Item) // Incluye el producto
                    .ThenInclude(p => p.Categoria) // Luego, incluye la categorÃ­a del producto
                .Include(pa => pa.Almacen) // Incluye el almacÃ©n
                .FirstOrDefaultAsync(pa => pa.Id == id);



        }


                public async Task<ProductoAlmacen> AddAsync(ProductoAlmacen productoAlmacen)
        {
            // Validar que ItemId y AlmacenId no sean nulos ni negativos
            if (productoAlmacen.ItemId <= 0 || productoAlmacen.AlmacenId <= 0)
            {
                throw new ArgumentException("El ItemId y el AlmacenId deben ser mayores que cero.");
            }

            // Validar que el Stock no sea negativo o nulo
            if (productoAlmacen.Stock <= 0)
            {
                throw new ArgumentException("El stock debe ser mayor que cero.");
            }

            // Validar existencia de Item y Almacen
            var item = await _context.Items.FirstOrDefaultAsync(i => i.Id == productoAlmacen.ItemId);
            var almacen = await _context.Almacenes.FirstOrDefaultAsync(a => a.Id == productoAlmacen.AlmacenId);

            if (item == null)
            {
                throw new KeyNotFoundException($"No se encontró un producto/insumo con ID {productoAlmacen.ItemId}.");
            }

            if (almacen == null)
            {
                throw new KeyNotFoundException($"No se encontró un almacén con ID {productoAlmacen.AlmacenId}.");
            }

            // Validar compatibilidad de tipos
            if (almacen.Tipo == "Productos" && item.Tipo != "Producto")
            {
                throw new InvalidOperationException("Este almacén solo admite productos terminados.");
            }
            if (almacen.Tipo == "Insumos" && item.Tipo != "Insumo")
            {
                throw new InvalidOperationException("Este almacén solo admite insumos (materia prima).");
            }

            // Verificar si la combinación ItemId - AlmacenId ya existe
            var existe = await _context.ProductosAlmacenes
                .AnyAsync(pa => pa.ItemId == productoAlmacen.ItemId && pa.AlmacenId == productoAlmacen.AlmacenId);

            if (existe)
            {
                throw new InvalidOperationException("El producto/insumo ya está asignado a este almacén.");
            }

            // Si todas las validaciones se cumplen, guardar en la base de datos
            _context.ProductosAlmacenes.Add(productoAlmacen);
            await _context.SaveChangesAsync();
            return productoAlmacen;
        }

        public async Task<bool> UpdateAsync(ProductoAlmacen productoAlmacen)
        {
            var existingProductoAlmacen = await _context.ProductosAlmacenes.FindAsync(productoAlmacen.Id);
            if (existingProductoAlmacen == null) return false;

            existingProductoAlmacen.ItemId = productoAlmacen.ItemId;
            existingProductoAlmacen.AlmacenId = productoAlmacen.AlmacenId;
            existingProductoAlmacen.Stock = productoAlmacen.Stock;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var productoAlmacen = await _context.ProductosAlmacenes.FindAsync(id);
            if (productoAlmacen == null) return false;

            _context.ProductosAlmacenes.Remove(productoAlmacen);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<AlmacenConProductosDto> GetAlmacenConProductosAsync(int almacenId)
        {
            // Obtener todos los productos relacionados con el almacÃ©n filtrado por AlmacenId
            var productosAlmacen = await _context.ProductosAlmacenes
                .Where(pa => pa.AlmacenId == almacenId)  // Filtrar por AlmacenId
                .Include(pa => pa.Item)  // Incluir la entidad Producto asociada
                    .ThenInclude(p => p.Categoria)  // Incluir la entidad Categoria asociada al Producto
                .Include(pa => pa.Almacen)  // Incluir la entidad Almacen
                .ToListAsync();  // Devolver todos los registros encontrados

            // Verificar si no se encuentran registros
            if (productosAlmacen == null || !productosAlmacen.Any())
            {
                return null; // Si no se encuentra el almacÃ©n o productos, devuelve null
            }

            // Obtener la informaciÃ³n del AlmacÃ©n (usamos el primer elemento, ya que todos los productos tienen el mismo AlmacenId)
            var almacen = productosAlmacen.FirstOrDefault()?.Almacen;

            // Verificar si el almacÃ©n existe
            if (almacen == null)
            {
                return null; // Si no se encuentra el almacÃ©n, devuelve null
            }

            // Mapeamos los datos a un DTO (Data Transfer Object) que podemos devolver
            var almacenConProductosDto = new AlmacenConProductosDto
            {
                AlmacenId = almacen.Id,
                AlmacenNombre = almacen.Nombre,
            Productos = productosAlmacen.Select(pa => new ProductoDto
            {
                ItemId = pa.ItemId,   // â ambos con I mayÃºscula
                Nombre = pa.Item.Nombre,
                Precio = (decimal)pa.Item.Precio,
                Categoria = pa.Item.Categoria.Nombre,
                Stock = pa.Stock
            }).ToList()
            };

            return almacenConProductosDto;
        }


        public async Task<bool> QuitarProductoDeAlmacenAsync(int ItemId, int almacenId)
        {
            // ValidaciÃ³n de parÃ¡metros
            if (ItemId <= 0)
            {
                throw new ArgumentException("El ItemId debe ser mayor que cero.");
            }

            if (almacenId <= 0)
            {
                throw new ArgumentException("El AlmacenId debe ser mayor que cero.");
            }

            try
            {
                // Validar si el producto existe en la base de datos
                var producto = await _context.Items.FindAsync(ItemId);
                if (producto == null)
                {
                    throw new KeyNotFoundException($"El producto con ID {ItemId} no existe.");
                }

                // Validar si el almacÃ©n existe en la base de datos
                var almacen = await _context.Almacenes.FindAsync(almacenId);
                if (almacen == null)
                {
                    throw new KeyNotFoundException($"El almacÃ©n con ID {almacenId} no existe.");
                }

                // Buscar la relaciÃ³n entre el producto y el almacÃ©n
                var productoAlmacen = await _context.ProductosAlmacenes
                    .FirstOrDefaultAsync(pa => pa.ItemId == ItemId && pa.AlmacenId == almacenId);

                // Validar si existe la relaciÃ³n entre el producto y el almacÃ©n
                if (productoAlmacen == null)
                {
                    throw new InvalidOperationException($"El producto con ID {ItemId} no estÃ¡ asociado al almacÃ©n con ID {almacenId}.");
                }

                // Eliminar la relaciÃ³n entre el producto y el almacÃ©n
                _context.ProductosAlmacenes.Remove(productoAlmacen);
                await _context.SaveChangesAsync();

                return true; // EliminaciÃ³n exitosa
            }
            catch (ArgumentException ex)
            {
                // ExcepciÃ³n de argumentos invÃ¡lidos
                throw new ArgumentException(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                // ExcepciÃ³n cuando no se encuentra el producto o el almacÃ©n
                throw new KeyNotFoundException(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                // ExcepciÃ³n cuando el producto no estÃ¡ asociado al almacÃ©n
                throw new InvalidOperationException(ex.Message);
            }
            catch (DbUpdateException dbEx)
            {
                // ExcepciÃ³n de actualizaciÃ³n en la base de datos (por ejemplo, problemas con claves forÃ¡neas)
                if (dbEx.InnerException is MySqlException mySqlEx)
                {
                    if (mySqlEx.Message.Contains("Cannot delete or update a parent row"))
                    {
                        // Producto en uso en otra transacciÃ³n
                        throw new InvalidOperationException("No se puede eliminar este producto porque estÃ¡ siendo utilizado en otra transacciÃ³n, como una venta.");
                    }
                }

                // Si ocurre otro error en la base de datos
                throw new Exception("OcurriÃ³ un error al intentar eliminar el producto del almacÃ©n.");
            }
            catch (Exception ex)
            {
                // Captura cualquier otro tipo de error general
                throw new Exception("OcurriÃ³ un error inesperado: " + ex.Message);
            }
        }
                public async Task<ProductoAlmacen> UpdateStockAsync(int itemId, int almacenId, int quantity)
        {
            var almacen = await _context.Almacenes.FirstOrDefaultAsync(a => a.Id == almacenId);
            if (almacen == null)
            {
                throw new KeyNotFoundException("El Almacén especificado no existe.");
            }

            var productoAlmacen = await _context.ProductosAlmacenes
                .FirstOrDefaultAsync(pa => pa.ItemId == itemId && pa.AlmacenId == almacenId);

            if (almacen.CapacidadMaxima.HasValue)
            {
                double currentStockOtherItems = await _context.ProductosAlmacenes
                    .Where(pa => pa.AlmacenId == almacenId && pa.ItemId != itemId)
                    .SumAsync(pa => pa.Stock);

                double currentStockThisItem = productoAlmacen != null ? productoAlmacen.Stock : 0;
                double newTotalStock = currentStockOtherItems + currentStockThisItem + quantity;

                if (newTotalStock > almacen.CapacidadMaxima.Value)
                {
                    throw new InvalidOperationException($"Capacidad insuficiente en el almacén '{almacen.Nombre}'. Capacidad máxima: {almacen.CapacidadMaxima.Value} uds, stock planeado: {newTotalStock} uds.");
                }
            }

            if (productoAlmacen == null)
            {
                var itemExiste = await _context.Items.AnyAsync(i => i.Id == itemId);
                if (!itemExiste)
                {
                    throw new KeyNotFoundException("El Item especificado no existe.");
                }

                productoAlmacen = new ProductoAlmacen
                {
                    ItemId = itemId,
                    AlmacenId = almacenId,
                    Stock = quantity
                };
                _context.ProductosAlmacenes.Add(productoAlmacen);
            }
            else
            {
                productoAlmacen.Stock += quantity;
                _context.ProductosAlmacenes.Update(productoAlmacen);
            }

            await _context.SaveChangesAsync();
            return productoAlmacen;
        }

                public async Task<List<ProductoAlmacen>> AddBulkAsync(int almacenId, List<ItemStockDto> itemsDto)
        {
            var almacen = await _context.Almacenes.FirstOrDefaultAsync(a => a.Id == almacenId);
            if (almacen == null)
            {
                throw new KeyNotFoundException($"No se encontró un almacén con ID {almacenId}.");
            }

            if (almacen.CapacidadMaxima.HasValue)
            {
                double otherItemsStock = await _context.ProductosAlmacenes
                    .Where(pa => pa.AlmacenId == almacenId && !itemsDto.Select(i => i.ItemId).Contains(pa.ItemId))
                    .SumAsync(pa => pa.Stock);

                double totalStockPlanned = otherItemsStock + itemsDto.Sum(i => i.Stock);

                if (totalStockPlanned > almacen.CapacidadMaxima.Value)
                {
                    throw new InvalidOperationException($"Capacidad insuficiente en el almacén '{almacen.Nombre}'. Capacidad máxima: {almacen.CapacidadMaxima.Value} uds, stock planeado: {totalStockPlanned} uds.");
                }
            }

            var resultados = new List<ProductoAlmacen>();

            foreach (var itemDto in itemsDto)
            {
                if (itemDto.ItemId <= 0 || itemDto.Stock <= 0)
                {
                    throw new ArgumentException("El ItemId y el Stock deben ser mayores que cero.");
                }

                var item = await _context.Items.FirstOrDefaultAsync(i => i.Id == itemDto.ItemId);
                if (item == null)
                {
                    throw new KeyNotFoundException($"No se encontró un item con ID {itemDto.ItemId}.");
                }

                // Validar compatibilidad de tipos
                if (almacen.Tipo == "Productos" && item.Tipo != "Producto")
                {
                    throw new InvalidOperationException($"El item '{item.Nombre}' no se puede asignar. Este almacén solo admite productos terminados.");
                }
                if (almacen.Tipo == "Insumos" && item.Tipo != "Insumo")
                {
                    throw new InvalidOperationException($"El item '{item.Nombre}' no se puede asignar. Este almacén solo admite insumos (materia prima).");
                }

                var existing = await _context.ProductosAlmacenes
                    .FirstOrDefaultAsync(pa => pa.ItemId == itemDto.ItemId && pa.AlmacenId == almacenId);

                if (existing != null)
                {
                    existing.Stock = itemDto.Stock;
                    _context.ProductosAlmacenes.Update(existing);
                    resultados.Add(existing);
                }
                else
                {
                    var nuevo = new ProductoAlmacen
                    {
                        ItemId = itemDto.ItemId,
                        AlmacenId = almacenId,
                        Stock = itemDto.Stock
                    };
                    _context.ProductosAlmacenes.Add(nuevo);
                    resultados.Add(nuevo);
                }
            }

            await _context.SaveChangesAsync();
            return resultados;
        }
    }
}
