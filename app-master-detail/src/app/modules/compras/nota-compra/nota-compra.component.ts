import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotaCompraService } from './service/nota-compra.service';
import { ProveedorService } from '../proveedor/service/proveedor.service';
import { AlmacenService } from '../../almacen/service/almacen.service';
import { ItemService } from '../../crear-item/service/item.service';
import { NotaCompra, CreateNotaCompraDto } from '../../../interfaces/nota-compra.interface';
import { Proveedor, getProveedorNombre } from '../../../interfaces/proveedor.interface';
import { Almacen } from '../../../interfaces/almacen.interface';
import { EmpleadoService } from '../../usuario/empleado.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nota-compra',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './nota-compra.component.html',
  styleUrl: './nota-compra.component.css',
})
export class NotaCompraComponent implements OnInit {
  notas = signal<NotaCompra[]>([]);
  proveedores = signal<Proveedor[]>([]);
  almacenes = signal<Almacen[]>([]);
  items = signal<any[]>([]);
  loading = signal(true);
  showModal = signal(false);
  searchTerm = signal('');
  filterEstado = signal('');
  errorMsg = signal('');
  empleadoRegistrador = signal<string>('Cargando...');

  form: CreateNotaCompraDto = {
    idProveedor: 0,
    idEmpleado: 1,
    estado: 'Completada',
    detalles: [],
  };

  constructor(
    private notaService: NotaCompraService,
    private proveedorService: ProveedorService,
    private almacenService: AlmacenService,
    private itemService: ItemService,
    private empleadoService: EmpleadoService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.errorMsg.set('');

    // Cargar catálogos
    this.almacenService.getAlmacenes().subscribe({
      next: (almacens) => this.almacenes.set(almacens ?? []),
      error: (err) => console.error('Error al cargar almacenes:', err)
    });

    this.itemService.getItems().subscribe({
      next: (itms) => this.items.set(itms ?? []),
      error: (err) => console.error('Error al cargar items:', err)
    });

    // Carga proveedores primero para el join
    this.proveedorService.getProveedores().subscribe({
      next: (provs) => {
        this.proveedores.set(provs ?? []);
        // Luego carga notas y enriquece con datos de proveedor
        this.notaService.getNotasCompra().subscribe({
          next: (notas) => {
            const enriched = (notas ?? []).map(n => ({
              ...n,
              proveedor: provs.find(p => p.idProveedor === n.idProveedor),
            }));
            this.notas.set(enriched);
            this.loading.set(false);
          },
          error: () => {
            this.errorMsg.set('No se pudieron cargar las notas de compra.');
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.proveedores.set([]);
        this.loading.set(false);
      }
    });
  }

  getProveedorNombreForNota(nota: NotaCompra): string {
    const p = nota.proveedor;
    if (!p) return `Proveedor #${nota.idProveedor}`;
    return getProveedorNombre(p);
  }

  getProveedorNombreDirect(p: Proveedor): string {
    return getProveedorNombre(p);
  }

  get filteredNotas(): NotaCompra[] {
    return this.notas().filter(n => {
      const matchSearch = !this.searchTerm() ||
        this.getProveedorNombreForNota(n).toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        String(n.idNotaCompra).includes(this.searchTerm());
      const matchEstado = !this.filterEstado() || n.estado === this.filterEstado();
      return matchSearch && matchEstado;
    });
  }

  getTotalByEstado(estado: string): number {
    return this.notas().filter(n => n.estado === estado).length;
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Completada': return 'badge-success';
      case 'Pendiente': return 'badge-warning';
      case 'Cancelada': return 'badge-danger';
      default: return 'badge-info';
    }
  }

  setFilter(estado: string): void {
    this.filterEstado.set(this.filterEstado() === estado ? '' : estado);
  }

  openModal(): void {
    // Tomar al usuario actual y obtener su idEmpleado
    const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    const idEmpleado = currentUser.idEmpleado || 1; // Fallback a 1 si no está asignado

    this.form = {
      idProveedor: 0,
      idEmpleado: idEmpleado,
      estado: 'Completada',
      detalles: [],
    };
    
    this.empleadoRegistrador.set(`Empleado #${idEmpleado}`);
    this.empleadoService.getEmpleadoById(idEmpleado).subscribe({
      next: (emp) => {
        if (emp && emp.nombre) {
          this.empleadoRegistrador.set(`${emp.nombre} ${emp.apellido}`);
        }
      },
      error: () => {
        this.empleadoRegistrador.set(`Empleado #${idEmpleado}`);
      }
    });
    
    // Agregar un primer detalle vacío por comodidad
    this.addDetail();
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  addDetail(): void {
    const defaultAlmacenId = this.almacenes().length > 0 ? (this.almacenes()[0].id || 0) : 0;
    const defaultItemId = this.items().length > 0 ? (this.items()[0].id || 0) : 0;
    
    this.form.detalles.push({
      idAlmacen: defaultAlmacenId,
      idItem: defaultItemId,
      cantidad: 1,
      precio: 0
    });
  }

  removeDetail(index: number): void {
    this.form.detalles.splice(index, 1);
  }

  get calculatedTotal(): number {
    return this.form.detalles.reduce((acc, d) => acc + (d.cantidad * d.precio), 0);
  }

  saveNotaCompra(): void {
    if (this.form.idProveedor === 0) {
      Swal.fire('Error', 'Selecciona un proveedor válido.', 'error');
      return;
    }

    if (this.form.detalles.length === 0) {
      Swal.fire('Error', 'Debe agregar al menos un detalle de compra.', 'error');
      return;
    }

    // Validar que cada detalle tenga valores válidos
    for (let i = 0; i < this.form.detalles.length; i++) {
      const d = this.form.detalles[i];
      if (d.idAlmacen === 0 || d.idItem === 0) {
        Swal.fire('Error', 'Todos los detalles deben tener un almacén e ítem válidos.', 'error');
        return;
      }
      if (d.cantidad <= 0 || d.precio < 0) {
        Swal.fire('Error', 'La cantidad debe ser mayor a 0 y el precio no puede ser negativo.', 'error');
        return;
      }
    }

    // Convertir IDs a números enteros por si acaso
    this.form.idProveedor = Number(this.form.idProveedor);
    this.form.idEmpleado = Number(this.form.idEmpleado);
    this.form.detalles = this.form.detalles.map(d => ({
      idAlmacen: Number(d.idAlmacen),
      idItem: Number(d.idItem),
      cantidad: Number(d.cantidad),
      precio: Number(d.precio)
    }));

    this.notaService.createNotaCompra(this.form).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Compra Registrada',
          text: 'La nota de compra y sus detalles han sido creados exitosamente.',
          confirmButtonText: 'OK'
        }).then(() => {
          this.closeModal();
          this.loadData();
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.mensaje || 'No se pudo crear la nota de compra.',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  getEstadosUnicos(): string[] {
    const estados = [...new Set(this.notas().map(n => n.estado))];
    return estados;
  }
}
