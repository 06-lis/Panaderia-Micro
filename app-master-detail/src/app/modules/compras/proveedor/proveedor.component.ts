import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProveedorService } from './service/proveedor.service';
import { Proveedor, CreateProveedorDto, getProveedorNombre } from '../../../interfaces/proveedor.interface';

@Component({
  selector: 'app-proveedor',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './proveedor.component.html',
  styleUrl: './proveedor.component.css',
})
export class ProveedorComponent implements OnInit {
  proveedores = signal<Proveedor[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editMode = signal(false);
  selectedId = signal<number | null>(null);
  searchTerm = signal('');
  errorMsg = signal('');

  form: CreateProveedorDto = {
    tipoProveedor: 'Persona',
    telefono: '',
    direccion: '',
    correo: '',
    nombre: '',
    razonSocial: '',
  };

  constructor(private proveedorService: ProveedorService) {}

  ngOnInit(): void {
    this.loadProveedores();
  }

  loadProveedores(): void {
    this.loading.set(true);
    this.errorMsg.set('');
    this.proveedorService.getProveedores().subscribe({
      next: (data) => {
        this.proveedores.set(data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('No se pudieron cargar los proveedores. Verifica que el servicio esté activo.');
        this.loading.set(false);
      }
    });
  }

  getDisplayName(p: Proveedor): string {
    return getProveedorNombre(p);
  }

  get filteredProveedores(): Proveedor[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.proveedores();
    return this.proveedores().filter(p =>
      getProveedorNombre(p).toLowerCase().includes(term) ||
      p.correo?.toLowerCase().includes(term) ||
      p.tipoProveedor?.toLowerCase().includes(term)
    );
  }

  get activeCount(): number {
    return this.proveedores().length;
  }

  get empresasCount(): number {
    return this.proveedores().filter(p => p.tipoProveedor === 'Empresa').length;
  }

  openCreateModal(): void {
    this.editMode.set(false);
    this.selectedId.set(null);
    this.form = { tipoProveedor: 'Persona', telefono: '', direccion: '', correo: '', nombre: '', razonSocial: '' };
    this.showModal.set(true);
  }

  openEditModal(p: Proveedor): void {
    this.editMode.set(true);
    this.selectedId.set(p.idProveedor);
    this.form = {
      tipoProveedor: p.tipoProveedor,
      telefono: p.telefono,
      direccion: p.direccion,
      correo: p.correo,
      nombre: p.nombre ?? '',
      razonSocial: p.razonSocial ?? '',
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onSubmit(): void {
    const dto = this.buildDto();
    if (this.editMode() && this.selectedId()) {
      this.proveedorService.updateProveedor(this.selectedId()!, dto).subscribe(() => {
        this.loadProveedores();
        this.closeModal();
      });
    } else {
      this.proveedorService.createProveedor(dto).subscribe((created) => {
        this.loadProveedores();
        this.closeModal();
      });
    }
  }

  private buildDto(): CreateProveedorDto {
    const dto: CreateProveedorDto = {
      tipoProveedor: this.form.tipoProveedor,
      telefono: this.form.telefono,
      direccion: this.form.direccion,
      correo: this.form.correo,
    };
    if (this.form.tipoProveedor === 'Persona') {
      dto.nombre = this.form.nombre;
    } else {
      dto.razonSocial = this.form.razonSocial;
    }
    return dto;
  }

  deleteProveedor(id: number): void {
    if (confirm('¿Seguro que deseas eliminar este proveedor?')) {
      this.proveedorService.deleteProveedor(id).subscribe(() => this.loadProveedores());
    }
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }
}
