import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { EspecialidadService, MedicoService, NotificationService, ConfirmModalService } from '../../services';
import { Especialidad, Medico, EspecialidadRow } from '../../models';
import { AdminTopbarComponent } from '../../componentes/admin-topbar/admin-topbar';
import { PaginacionComponent } from '../../componentes/paginacion/paginacion';

@Component({
  selector: 'app-especialidades-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminTopbarComponent, PaginacionComponent],
  templateUrl: './especialidades-admin.html',
  styleUrl: './especialidades-admin.css'
})
export class EspecialidadesAdminComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly medicoService = inject(MedicoService);
  private readonly notify = inject(NotificationService);
  private readonly confirmModal = inject(ConfirmModalService);

  readonly filtroNombre = signal<string>('');
  readonly filtroDepto = signal<string>('Todos');
  readonly filtroEstado = signal<string>('Todas');

  readonly paginaActual = signal<number>(1);
  readonly tamanoPagina = signal<number>(10);

  readonly cargando = signal<boolean>(false);
  readonly especialidades = signal<EspecialidadRow[]>([]);
  readonly totalMedicosRegistrados = signal<number>(0);

  readonly listaFiltrada = computed(() => {
    const qNombre = this.filtroNombre().toLowerCase().trim();
    const fDepto = this.filtroDepto();
    const fEstado = this.filtroEstado();
    const lista = this.especialidades();

    return lista.filter(item => {
      const matchNombre = !qNombre ||
        item.nombre.toLowerCase().includes(qNombre) ||
        item.departamento.toLowerCase().includes(qNombre);
      const matchDepto = fDepto === 'Todos' || item.departamento === fDepto;
      const matchEstado = fEstado === 'Todas' || item.estado === fEstado;
      return matchNombre && matchDepto && matchEstado;
    });
  });

  readonly especialidadesPaginadas = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina();
    return this.listaFiltrada().slice(inicio, inicio + this.tamanoPagina());
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.especialidadService.listar().subscribe({
      next: (especialidadesData: Especialidad[]) => {
        this.medicoService.listar().subscribe({
          next: (medicosData: Medico[]) => {
            this.totalMedicosRegistrados.set(medicosData.length);
            const items = especialidadesData.map(esp => {
              const medicosCount = medicosData.filter(m => m.especialidad?.idEspecialidad === esp.idEspecialidad).length;
              return {
                id: esp.idEspecialidad,
                nombre: esp.nombre,
                departamento: this.inferirDepartamento(esp.nombre),
                duracion: 30,
                medicos: medicosCount,
                estado: 'Activa',
                icono: this.obtenerIcono(esp.nombre),
                bgClase: this.obtenerBgClase(esp.nombre)
              };
            });
            this.especialidades.set(items);
            this.cargando.set(false);
          },
          error: (err) => {
            console.error('Error al listar médicos para especialidades:', err);
            const items = especialidadesData.map(esp => ({
              id: esp.idEspecialidad,
              nombre: esp.nombre,
              departamento: this.inferirDepartamento(esp.nombre),
              duracion: 30,
              medicos: 0,
              estado: 'Activa',
              icono: this.obtenerIcono(esp.nombre),
              bgClase: 'bg-blue-soft'
            }));
            this.especialidades.set(items);
            this.cargando.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error al listar especialidades desde la API:', err);
        this.cargando.set(false);
      }
    });
  }

  resetearFiltros(): void {
    this.filtroNombre.set('');
    this.filtroDepto.set('Todos');
    this.filtroEstado.set('Todas');
    this.paginaActual.set(1);
  }

  abrirModalNueva(): void {
    this.router.navigate(['/admin/especialidades/nuevo']);
  }

  editarEspecialidad(e: EspecialidadRow): void {
    this.router.navigate(['/admin/especialidades/editar', e.id]);
  }

  async eliminarEspecialidad(e: EspecialidadRow): Promise<void> {
    const confirmado = await this.confirmModal.confirm({
      titulo: '¿Eliminar Especialidad?',
      mensaje: `¿Confirma que desea eliminar la especialidad "${e.nombre}" del catálogo médico?`,
      textoConfirmar: 'Eliminar Especialidad',
      tipo: 'danger'
    });

    if (!confirmado) return;

    this.especialidadService.eliminar(e.id).subscribe({
      next: () => {
        this.notify.success(`Especialidad "${e.nombre}" eliminada exitosamente.`);
        this.cargarDatos();
      },
      error: (err) => {
        console.error('Error al eliminar especialidad:', err);
        this.notify.error(err?.error?.message || 'No se pudo eliminar la especialidad. Verifique que no posea médicos asociados.');
      }
    });
  }

  verDetalle(item: EspecialidadRow): void {
    this.router.navigate(['/admin/especialidades', item.id, 'detalle']);
  }

  private inferirDepartamento(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('cardio')) return 'Cardiología';
    if (n.includes('pediat') || n.includes('infan') || n.includes('materno')) return 'Materno Infantil';
    if (n.includes('trauma') || n.includes('ortop') || n.includes('cirug')) return 'Cirugía';
    if (n.includes('neuro')) return 'Neurociencias';
    if (n.includes('ginec') || n.includes('obstet')) return 'Salud Femenina';
    return 'Medicina General';
  }

  private obtenerIcono(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('cardio')) return '🫀';
    if (n.includes('pediat')) return '🍼';
    if (n.includes('trauma')) return '🦴';
    if (n.includes('neuro')) return '🧠';
    if (n.includes('ginec')) return '🤰';
    return '🩺';
  }

  private obtenerBgClase(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('cardio')) return 'bg-blue-soft';
    if (n.includes('pediat')) return 'bg-cyan-soft';
    if (n.includes('neuro')) return 'bg-purple-soft';
    return 'bg-blue-soft';
  }
}
