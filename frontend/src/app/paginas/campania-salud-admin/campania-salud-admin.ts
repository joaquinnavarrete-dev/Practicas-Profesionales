import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CampaniaSaludService } from '../../services';
import { NotificationService } from '../../services';
import { ConfirmModalService } from '../../services';
import { CampaniaSalud, CampaniaRequest } from '../../models';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-campania-salud-admin',
  styleUrl: './campania-salud-admin.css',
  templateUrl: './campania-salud-admin.html',
})
export class CampaniaSaludAdminComponent implements OnInit {
  private campaniaService = inject(CampaniaSaludService);
  private notifService = inject(NotificationService);
  private confirmService = inject(ConfirmModalService);

  readonly busquedaTexto = signal<string>('');
  readonly filtroEstado = signal<string>('');

  readonly totalCampanias = computed(() => this.campanias().length);

  readonly campaniasEnCurso = computed(() =>
    this.campanias().filter(p => p.estado === 'En Curso').length
  );

  readonly campaniasPlanificadas = computed(() =>
    this.campanias().filter(p => p.estado === 'Planificada').length
  );

  readonly totalCupos = computed(() =>
    this.campanias().reduce((acum, c) => acum + (Number(c.cupoMaximo) || 0), 0)
  );

  readonly campaniasFiltradas = computed(() => {
    const q = this.busquedaTexto().toLowerCase().trim();
    const estado = this.filtroEstado();

    return this.campanias().filter(p => {
      const nombre = (p.nombre || '').toLowerCase();

      const matchQuery = !q || nombre.includes(q);
      const matchEstado = estado === 'Todos' || p.estado === estado;

      return matchQuery && matchEstado;
    });
  });

  readonly campanias = signal<CampaniaSalud[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly guardando = signal<boolean>(false);
  readonly editandoId = signal<number | null>(null);
  readonly mostrarFormulario = signal<boolean>(false);

  formData: CampaniaRequest = {
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    publicoObjetivo: '',
    cupoMaximo: 0,
    estado: 'Planificada'
  };

  ngOnInit(): void {
    this.cargarCampanias();
  }

  limpiarFiltros(): void {
    this.busquedaTexto.set('');
    this.filtroEstado.set('Todos');
  }

  cargarCampanias(): void {
    this.cargando.set(true);
    this.campaniaService.listar().subscribe({
      next: (cam) => {
        this.campanias.set(cam);
        this.cargando.set(false);
      },
      error: () => {
        this.notifService.error('Error al cargar las campañas');
        this.cargando.set(false);
      }
    });
  }

  abrirCrear(): void {
    this.editandoId.set(null);
    this.formData = {
      nombre: '',
      descripcion: '',
      fechaInicio: '',
      fechaFin: '',
      publicoObjetivo: '',
      cupoMaximo: 0,
      estado: 'Planificada'
    };
    this.mostrarFormulario.set(true);
  }

  abrirEditar(cam: CampaniaSalud): void {
    this.editandoId.set(cam.id);
    this.formData = {
      nombre: cam.nombre,
      descripcion: cam.descripcion,
      fechaInicio: cam.fechaInicio,
      fechaFin: cam.fechaFin,
      publicoObjetivo: cam.publicoObjetivo,
      cupoMaximo: cam.cupoMaximo,
      estado: cam.estado
    };
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.editandoId.set(null);
  }

  guardar(): void {
    if (!this.formData.nombre) {
      this.notifService.warning('Por favor complete todos los campos obligatorios');
      return;
    }

    this.guardando.set(true);
    const id = this.editandoId();

    if (this.formData.fechaFin < this.formData.fechaInicio) {
      this.notifService.warning('La fecha de fin no puede ser anterior a la fecha de inicio.');
      return;
    }

    if (id) {
      //editar
      this.campaniaService.actualizar(id, this.formData).subscribe({
        next: () => {
          this.notifService.success('Campañia modificada correctamente');
          this.guardando.set(false);
          this.cerrarFormulario();
          this.cargarCampanias();
        },
        error: (err) => {
          this.notifService.error(err?.error?.message || 'Error al actualizar la campañia');
          this.guardando.set(false);
        }
      });
    } else {
      //crear
      this.campaniaService.crear(this.formData).subscribe({
        next: () => {
          this.notifService.success('Campañia agregada correctamente');
          this.guardando.set(false);
          this.cerrarFormulario();
          this.cargarCampanias();
        },
        error: (err) => {
          this.notifService.error(err?.error?.message || 'Error al crear la campañia');
          this.guardando.set(false);
        }
      });
    }
  }

  async eliminar(cam: CampaniaSalud): Promise<void> {
    const confirmado = await this.confirmService.confirm({
      titulo: 'Eliminar campañia',
      mensaje: `¿Seguro que desea eliminar la campañia "${cam.nombre}"?`,
      textoConfirmar: 'Eliminar',
      tipo: 'danger'
    });

    if (!confirmado) return;

    this.campaniaService.eliminar(cam.id).subscribe({
      next: () => {
        this.notifService.success('Campañia eliminada con exito');
        this.cargarCampanias();
      },
      error: () => {
        this.notifService.error('Error al eliminar la campañia');
      }
    });
  }
}
