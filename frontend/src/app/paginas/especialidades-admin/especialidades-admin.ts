import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { EspecialidadService, MedicoService, NotificationService, ConfirmModalService } from '../../services';
import { Especialidad, Medico } from '../../models';

export interface EspecialidadRow {
  id: number;
  nombre: string;
  departamento: string;
  duracion: number;
  medicos: number;
  estado: string;
  icono: string;
  bgClase: string;
}

@Component({
  selector: 'app-especialidades-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './especialidades-admin.html',
  styleUrl: './especialidades-admin.css'
})
export class EspecialidadesAdminComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly medicoService = inject(MedicoService);
  private readonly notify = inject(NotificationService);
  private readonly confirmModal = inject(ConfirmModalService);

  terminoGlobal: string = '';
  filtroNombre: string = '';
  filtroDepto: string = 'Todos';
  filtroEstado: string = 'Todas';

  cargando: boolean = false;
  especialidades: EspecialidadRow[] = [];
  listaFiltrada: EspecialidadRow[] = [];
  totalMedicosRegistrados: number = 0;

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.especialidadService.listar().subscribe({
      next: (especialidadesData: Especialidad[]) => {
        this.medicoService.listar().subscribe({
          next: (medicosData: Medico[]) => {
            this.totalMedicosRegistrados = medicosData.length;
            this.especialidades = especialidadesData.map(esp => {
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
            this.aplicarFiltros();
            this.cargando = false;
          },
          error: (err) => {
            console.error('Error al listar médicos para especialidades:', err);
            this.especialidades = especialidadesData.map(esp => ({
              id: esp.idEspecialidad,
              nombre: esp.nombre,
              departamento: this.inferirDepartamento(esp.nombre),
              duracion: 30,
              medicos: 0,
              estado: 'Activa',
              icono: this.obtenerIcono(esp.nombre),
              bgClase: 'bg-blue-soft'
            }));
            this.aplicarFiltros();
            this.cargando = false;
          }
        });
      },
      error: (err) => {
        console.error('Error al listar especialidades desde la API:', err);
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    const qGlobal = this.terminoGlobal.toLowerCase().trim();
    const qNombre = this.filtroNombre.toLowerCase().trim();

    this.listaFiltrada = this.especialidades.filter(item => {
      const matchGlobal = !qGlobal ||
        item.nombre.toLowerCase().includes(qGlobal) ||
        item.departamento.toLowerCase().includes(qGlobal);
      const matchNombre = !qNombre || item.nombre.toLowerCase().includes(qNombre);
      const matchDepto = this.filtroDepto === 'Todos' || item.departamento === this.filtroDepto;
      const matchEstado = this.filtroEstado === 'Todas' || item.estado === this.filtroEstado;
      return matchGlobal && matchNombre && matchDepto && matchEstado;
    });
  }

  resetearFiltros(): void {
    this.terminoGlobal = '';
    this.filtroNombre = '';
    this.filtroDepto = 'Todos';
    this.filtroEstado = 'Todas';
    this.listaFiltrada = [...this.especialidades];
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
    this.notify.info(`Departamento: ${item.departamento} • ${item.medicos} médicos asignados`, item.nombre);
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
