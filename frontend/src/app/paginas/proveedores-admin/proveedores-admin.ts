import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProveedorService } from '../../services';
import { NotificationService } from '../../services';
import { ConfirmModalService } from '../../services';
import { Proveedor, ProveedorRequest } from '../../models';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-proveedores-admin',
  styleUrl: './proveedores-admin.css',
  templateUrl: './proveedores-admin.html',
})
export class ProveedoresAdminComponent implements OnInit {

  private proveedorService = inject(ProveedorService);
  private notifService = inject(NotificationService);
  private confirmService = inject(ConfirmModalService);

  readonly busquedaTexto = signal<string>('');
  readonly filtroRubro = signal<string>('');
  readonly filtroEstado = signal<string>('');

  readonly totalProveedores = computed(() => this.proveedores().length);

  readonly proveedoresActivos = computed(() =>
    this.proveedores().filter(p => p.estado === 'Activo').length
  );

  readonly proveedoresInactivos = computed(() =>
    this.proveedores().filter(p => p.estado === 'Inactivo').length
  );

  readonly totalRubros = computed(() => {
    const rubros = new Set(this.proveedores().map(p => p.rubro));
    return rubros.size;
  });

  readonly proveedoresFiltrados = computed(() => {
    const q = this.busquedaTexto().toLowerCase().trim();
    const rubro = this.filtroRubro();
    const estado = this.filtroEstado();

    return this.proveedores().filter(p => {
      const nombre = (p.razonSocial || '').toLowerCase();
      const cuit = p.cuit || '';

      const matchQuery = !q || nombre.includes(q) || cuit.includes(q);
      const matchRubro = rubro === 'Todos' || p.rubro === rubro;
      const matchEstado = estado === 'Todos' || p.estado === estado;

      return matchQuery && matchRubro && matchEstado;
    });
  });

  readonly proveedores = signal<Proveedor[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly guardando = signal<boolean>(false);
  readonly editandoId = signal<number | null>(null);
  readonly mostrarFormulario = signal<boolean>(false);

  formData: ProveedorRequest = {
    razonSocial: '',
    cuit: '',
    rubro: '',
    telefono: '',
    email: '',
    estado: ''
  };

  ngOnInit(): void {
    this.cargarProveedores();
  }

  limpiarFiltros(): void {
    this.busquedaTexto.set('');
    this.filtroRubro.set('Todos');
    this.filtroEstado.set('Todos');
  }

  cargarProveedores(): void {
    this.cargando.set(true);
    this.proveedorService.listar().subscribe({
      next: (provs) => {
        this.proveedores.set(provs);
        this.cargando.set(false);
      },
      error: () => {
        this.notifService.error('Error al cargar los proveedores');
        this.cargando.set(false);
      }
    });
  }

  abrirCrear(): void {
    this.editandoId.set(null);
    this.formData = {
      razonSocial: '',
      cuit: '',
      rubro: '',
      telefono: '',
      email: '',
      estado: 'Activo'
    };
    this.mostrarFormulario.set(true);
  }

  abrirEditar(prov: Proveedor): void {
    this.editandoId.set(prov.id);
    this.formData = {
      razonSocial: prov.razonSocial,
      cuit: prov.cuit,
      rubro: prov.rubro,
      telefono: prov.telefono,
      email: prov.email,
      estado: prov.estado
    };
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.editandoId.set(null);
  }

  guardar(): void {
    if (!this.formData.razonSocial) {
      this.notifService.warning('Por favor complete todos los campos obligatorios');
      return;
    }

    this.guardando.set(true);
    const id = this.editandoId();

    if (id) {
      //editar
      this.proveedorService.actualizar(id, this.formData).subscribe({
        next: () => {
          this.notifService.success('Proveedor modificado correctamente');
          this.guardando.set(false);
          this.cerrarFormulario();
          this.cargarProveedores();
        },
        error: (err) => {
          this.notifService.error(err?.error?.message || 'Error al actualizar el proveedor');
          this.guardando.set(false);
        }
      });
    } else {
      //crear
      this.proveedorService.crear(this.formData).subscribe({
        next: () => {
          this.notifService.success('Proveedor agregado correctamente');
          this.guardando.set(false);
          this.cerrarFormulario();
          this.cargarProveedores();
        },
        error: (err) => {
          this.notifService.error(err?.error?.message || 'Error al crear el proveedor');
          this.guardando.set(false);
        }
      });
    }
  }

  async eliminar(prov: Proveedor): Promise<void> {
    const confirmado = await this.confirmService.confirm({
      titulo: 'Eliminar proveedor',
      mensaje: `¿Seguro que desea eliminar el proveedor "${prov.razonSocial}"?`,
      textoConfirmar: 'Eliminar',
      tipo: 'danger'
    });

    if (!confirmado) return;

    this.proveedorService.eliminar(prov.id).subscribe({
      next: () => {
        this.notifService.success('Proveedor eliminado con exito');
        this.cargarProveedores();
      },
      error: () => {
        this.notifService.error('Error al eliminar el proveedor');
      }
    });
  }

}
