import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TurnoService } from '../../services/turno.service';
import { EspecialidadService } from '../../services/especialidad.service';
import { NotificationService } from '../../services/notification.service';
import { ConfirmModalService } from '../../services/confirm-modal.service';
import { Turno, Especialidad } from '../../models';

@Component({
  selector: 'app-turnos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './turnos-admin.html',
  styleUrl: './turnos-admin.css'
})
export class TurnosAdminComponent implements OnInit {
  private readonly turnoService = inject(TurnoService);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly notify = inject(NotificationService);
  private readonly confirmModal = inject(ConfirmModalService);
  private readonly route = inject(ActivatedRoute);

  readonly busquedaGlobal = signal<string>('');
  readonly fechaFiltro = signal<string>('');
  readonly especialidadFiltro = signal<string>('Todas');

  readonly turnos = signal<Turno[]>([]);
  readonly especialidades = signal<Especialidad[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  readonly turnosFiltrados = computed(() => {
    const q = this.busquedaGlobal().toLowerCase().trim();
    const fFecha = this.fechaFiltro();
    const fEsp = this.especialidadFiltro();
    const lista = this.turnos();

    return lista.filter(t => {
      const matchFecha = !fFecha || t.fecha === fFecha;
      const matchEsp = fEsp === 'Todas' || t.especialidad.nombre === fEsp;

      const pacienteFull = `${t.paciente.nombre} ${t.paciente.apellido}`.toLowerCase();
      const medicoFull = `${t.medico.nombre} ${t.medico.apellido}`.toLowerCase();
      const matchQuery = !q ||
        pacienteFull.includes(q) ||
        t.paciente.dni.includes(q) ||
        medicoFull.includes(q) ||
        t.especialidad.nombre.toLowerCase().includes(q);

      return matchFecha && matchEsp && matchQuery;
    });
  });

  ngOnInit(): void {
    const idMedicoParam = this.route.snapshot.queryParams['idMedico'];

    this.cargarEspecialidades();
    this.cargarTurnos(idMedicoParam ? Number(idMedicoParam) : undefined);
  }

  cargarTurnos(idMedicoFiltro?: number): void {
    this.cargando.set(true);
    this.errorMessage.set('');

    this.turnoService.listarTodos().subscribe({
      next: (data) => {
        if (idMedicoFiltro) {
          this.turnos.set(data.filter(t => t.medico.idMedico === idMedicoFiltro));
        } else {
          this.turnos.set(data);
        }
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        console.error('Error al cargar turnos:', err);
        this.errorMessage.set('No se pudieron cargar los turnos desde el servidor.');
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
    this.fechaFiltro.set('');
    this.especialidadFiltro.set('Todas');
  }

  async cancelarTurno(t: Turno): Promise<void> {
    const confirmado = await this.confirmModal.confirm({
      titulo: '¿Cancelar Turno?',
      mensaje: `¿Confirma la cancelación del turno del paciente ${t.paciente.nombre} ${t.paciente.apellido} agendado para el ${t.fecha} a las ${t.hora} hs?`,
      textoConfirmar: 'Sí, Cancelar Turno',
      tipo: 'danger'
    });

    if (!confirmado) return;

    this.turnoService.cancelar(t.idTurno).subscribe({
      next: () => {
        this.turnos.update(lista => lista.filter(item => item.idTurno !== t.idTurno));
        this.notify.success(`El turno de ${t.paciente.nombre} ${t.paciente.apellido} ha sido cancelado.`);
      },
      error: (err) => {
        console.error('Error al cancelar turno:', err);
        this.notify.error(err.error?.message || 'No se pudo cancelar el turno.');
      }
    });
  }
}
