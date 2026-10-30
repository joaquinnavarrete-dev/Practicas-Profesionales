import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MedicoService } from '../../services/medico.service';
import { EspecialidadService } from '../../services/especialidad.service';
import { NotificationService } from '../../services/notification.service';
import { ConfirmModalService } from '../../services/confirm-modal.service';
import { Medico, Especialidad } from '../../models';

@Component({
  selector: 'app-medicos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medicos-admin.html',
  styleUrl: './medicos-admin.css'
})
export class MedicosAdminComponent implements OnInit {
  private readonly medicoService = inject(MedicoService);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly notify = inject(NotificationService);
  private readonly confirmModal = inject(ConfirmModalService);
  private readonly router = inject(Router);

  readonly busquedaGlobal = signal<string>('');
  readonly especialidadFiltro = signal<string>('Todas');

  readonly medicos = signal<Medico[]>([]);
  readonly especialidades = signal<Especialidad[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  readonly medicosFiltrados = computed(() => {
    const q = this.busquedaGlobal().toLowerCase().trim();
    const filtroEsp = this.especialidadFiltro();
    const lista = this.medicos();

    return lista.filter(m => {
      const matchEsp = filtroEsp === 'Todas' ||
        m.especialidad.nombre === filtroEsp;

      const nombreCompleto = `${m.nombre} ${m.apellido}`.toLowerCase();
      const matchQuery = !q ||
        nombreCompleto.includes(q) ||
        m.matricula.toLowerCase().includes(q) ||
        m.especialidad.nombre.toLowerCase().includes(q);

      return matchEsp && matchQuery;
    });
  });

  ngOnInit(): void {
    this.cargarMedicos();
    this.cargarEspecialidades();
  }

  cargarMedicos(): void {
    this.cargando.set(true);
    this.errorMessage.set('');
    this.medicoService.listar().subscribe({
      next: (data) => {
        this.medicos.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        console.error('Error al cargar médicos:', err);
        this.errorMessage.set('No se pudo conectar con el servidor para cargar el padrón médico.');
      }
    });
  }

  cargarEspecialidades(): void {
    this.especialidadService.listar().subscribe({
      next: (data) => {
        this.especialidades.set(data);
      },
      error: (err) => {
        console.error('Error al cargar especialidades:', err);
      }
    });
  }

  aplicarFiltros(): void {
    // Computado reactivamente por Signals
  }

  resetearFiltros(): void {
    this.busquedaGlobal.set('');
    this.especialidadFiltro.set('Todas');
  }

  abrirModalCrear(): void {
    this.router.navigate(['/admin/medicos/nuevo']);
  }

  verAgenda(m: Medico): void {
    this.router.navigate(['/admin/turnos'], { queryParams: { idMedico: m.idMedico } });
  }

  editarMedico(m: Medico): void {
    this.router.navigate(['/admin/medicos/editar', m.idMedico]);
  }

  async eliminarMedico(m: Medico): Promise<void> {
    const confirmado = await this.confirmModal.confirm({
      titulo: '¿Eliminar Médico?',
      mensaje: `¿Confirma que desea dar de baja al profesional Dr(a). ${m.nombre} ${m.apellido}? Esta acción no se puede deshacer.`,
      textoConfirmar: 'Eliminar Médico',
      tipo: 'danger'
    });

    if (!confirmado) return;

    this.medicoService.eliminar(m.idMedico).subscribe({
      next: () => {
        this.notify.success(`El Dr(a). ${m.nombre} ${m.apellido} fue eliminado correctamente.`);
        this.cargarMedicos();
      },
      error: (err) => {
        console.error('Error al eliminar médico:', err);
        this.notify.error(err.error?.message || 'No se puede eliminar el médico si tiene turnos o agendas activas.');
      }
    });
  }
}
