using System.Collections.Generic;

namespace MSVenta.Venta.DTOs
{
    public class AsignarBulkDto
    {
        public int AlmacenId { get; set; }
        public List<ItemStockDto> Items { get; set; }
    }

    public class ItemStockDto
    {
        public int ItemId { get; set; }
        public int Stock { get; set; }
    }
}
