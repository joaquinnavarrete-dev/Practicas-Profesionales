import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TurnoService } from '../../services/turno.service';
import { EspecialidadService } from '../../services/especialidad.service';
import { NotificationService } from '../../services/notification.service';
import { ConfirmModalService } from '../../services/confirm-modal.service';
import { AuthService } from '../../services/auth.service';
import { Turno, Especialidad } from '../../models';
import { FechaFormatoPipe, HoraFormatoPipe, CoberturaPipe } from '../../pipes';
import { AdminTopbarComponent } from '../../componentes/admin-topbar/admin-topbar';
import { PaginacionComponent } from '../../componentes/paginacion/paginacion';

@Component({
  selector: 'app-turnos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FechaFormatoPipe, HoraFormatoPipe, CoberturaPipe, AdminTopbarComponent, PaginacionComponent],
  templateUrl: './turnos-admin.html',
  styleUrl: './turnos-admin.css'
})
export class TurnosAdminComponent implements OnInit {
  private readonly turnoService = inject(TurnoService);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly notify = inject(NotificationService);
  private readonly confirmModal = inject(ConfirmModalService);
  private readonly route = inject(ActivatedRoute);
  readonly authService = inject(AuthService);

  readonly busquedaGlobal = signal<string>('');
  readonly fechaFiltro = signal<string>('');
  readonly especialidadFiltro = signal<string>('Todas');
  readonly estadoFiltro = signal<string>('Todos');
  readonly conteoReubicacion = signal<number>(0);

  readonly paginaActual = signal<number>(1);
  readonly tamanoPagina = signal<number>(10);

  readonly turnos = signal<Turno[]>([]);
  readonly especialidades = signal<Especialidad[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  readonly turnosFiltrados = computed(() => {
    const q = this.busquedaGlobal().toLowerCase().trim();
    const fFecha = this.authService.isRecepcionista() && !this.fechaFiltro()
      ? new Date().toISOString().split('T')[0]
      : this.fechaFiltro();
    const fEsp = this.especialidadFiltro();
    const fEstado = this.estadoFiltro();
    const lista = this.turnos();

    return lista.filter(t => {
      const matchFecha = !fFecha || t.fecha === fFecha;
      const matchEsp = fEsp === 'Todas' || t.especialidad.nombre === fEsp;
      const matchEstado = fEstado === 'Todos' || t.estado === fEstado;

      const pacienteFull = `${t.paciente.nombre} ${t.paciente.apellido}`.toLowerCase();
      const medicoFull = `${t.medico.nombre} ${t.medico.apellido}`.toLowerCase();
      const matchQuery = !q ||
        pacienteFull.includes(q) ||
        t.paciente.dni.includes(q) ||
        medicoFull.includes(q) ||
        t.especialidad.nombre.toLowerCase().includes(q) ||
        (t.estado && t.estado.toLowerCase().includes(q));

      return matchFecha && matchEsp && matchEstado && matchQuery;
    });
  });

  readonly turnosPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina();
    return this.turnosFiltrados().slice(inicio, inicio + this.tamanoPagina());
  });

  ngOnInit(): void {
    if (this.authService.isRecepcionista()) {
      this.fechaFiltro.set(new Date().toISOString().split('T')[0]);
    }

    const idMedicoParam = this.route.snapshot.queryParams['idMedico'];

    this.cargarEspecialidades();
    this.cargarTurnos(idMedicoParam ? Number(idMedicoParam) : undefined);
    this.verificarPendientesReubicacion();
  }

  verificarPendientesReubicacion(): void {
    this.turnoService.conteoPendientesReubicacion().subscribe({
      next: (res) => {
        const count = res?.conteo || 0;
        this.conteoReubicacion.set(count);
        if (count > 0 && (this.authService.isRecepcionista() || this.authService.isAdmin())) {
          this.notify.warning(`Hay ${count} turno(s) pendiente(s) de reubicación por cambios en la agenda médica de los profesionales.`, 'Atención Reubicación');
        }
      },
      error: (err) => {
        console.error('Error al verificar turnos pendientes de reubicación:', err);
      }
    });
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

  resetearFiltros(): void {
    this.busquedaGlobal.set('');
    this.fechaFiltro.set(this.authService.isRecepcionista() ? new Date().toISOString().split('T')[0] : '');
    this.especialidadFiltro.set('Todas');
    this.estadoFiltro.set('Todos');
    this.paginaActual.set(1);
  }

  confirmarAsistencia(t: Turno): void {
    this.turnoService.cambiarEstado(t.idTurno, 'Confirmado').subscribe({
      next: () => {
        this.turnos.update(lista =>
          lista.map(item => item.idTurno === t.idTurno ? { ...item, estado: 'Confirmado' } : item)
        );
        this.notify.success(
          `Asistencia confirmada para ${t.paciente.nombre} ${t.paciente.apellido}. El médico ya puede atenderlo.`,
          'Check-In Exitoso'
        );
      },
      error: (err) => {
        console.error('Error al confirmar asistencia de turno:', err);
        this.notify.error(err.error?.message || 'No se pudo confirmar el turno.');
      }
    });
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
