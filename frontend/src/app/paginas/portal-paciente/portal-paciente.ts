import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TurnoService } from '../../services/turno.service';
import { PacienteService } from '../../services/paciente.service';
import { ObraSocialService } from '../../services/obra-social.service';
import { NotificationService } from '../../services/notification.service';
import { ConfirmModalService } from '../../services/confirm-modal.service';
import { Turno, Paciente, ObraSocial, ActualizarPerfilPacienteRequest } from '../../models';

@Component({
  selector: 'app-portal-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './portal-paciente.html',
  styleUrl: './portal-paciente.css'
})
export class PortalPacienteComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly turnoService = inject(TurnoService);
  private readonly pacienteService = inject(PacienteService);
  private readonly obraSocialService = inject(ObraSocialService);
  private readonly notify = inject(NotificationService);
  private readonly confirmModal = inject(ConfirmModalService);

  readonly cargando = signal<boolean>(true);
  readonly tabActiva = signal<'turnos' | 'perfil'>('turnos');
  readonly subtabTurnos = signal<'proximos' | 'historial'>('proximos');

  readonly paciente = signal<Paciente | null>(null);
  readonly turnos = signal<Turno[]>([]);
  readonly obrasSociales = signal<ObraSocial[]>([]);
  readonly guardandoPerfil = signal<boolean>(false);

  perfilForm = {
    nombre: '',
    apellido: '',
    telefono: '',
    idObraSocial: null as number | null
  };

  readonly turnosActivos = computed(() => {
    const hoyStr = this.getFechaHoyIso();
    return this.turnos()
      .filter(t => t.fecha >= hoyStr)
      .sort((a, b) => {
        if (a.fecha === b.fecha) {
          return a.hora.localeCompare(b.hora);
        }
        return a.fecha.localeCompare(b.fecha);
      });
  });

  readonly turnosPasados = computed(() => {
    const hoyStr = this.getFechaHoyIso();
    return this.turnos()
      .filter(t => t.fecha < hoyStr)
      .sort((a, b) => {
        if (a.fecha === b.fecha) {
          return b.hora.localeCompare(a.hora);
        }
        return b.fecha.localeCompare(a.fecha);
      });
  });

  readonly proximoTurnoDestacado = computed(() => {
    const activos = this.turnosActivos();
    return activos.length > 0 ? activos[0] : null;
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);

    this.pacienteService.obtenerMiPerfil().subscribe({
      next: (perfil) => {
        this.paciente.set(perfil);
        this.perfilForm = {
          nombre: perfil.nombre || '',
          apellido: perfil.apellido || '',
          telefono: perfil.telefono || '',
          idObraSocial: perfil.obraSocial ? perfil.obraSocial.idObraSocial : null
        };

        this.cargarTurnos();
        this.cargarObrasSociales();
      },
      error: (err) => {
        console.error('Error al cargar perfil de paciente:', err);
        this.cargando.set(false);
        this.notify.error('No se pudo cargar la información del perfil del paciente.');
      }
    });
  }

  cargarTurnos(): void {
    this.turnoService.listarMisTurnos().subscribe({
      next: (data) => {
        this.turnos.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar turnos del paciente:', err);
        this.cargando.set(false);
      }
    });
  }

  cargarObrasSociales(): void {
    this.obraSocialService.listar().subscribe({
      next: (list) => {
        this.obrasSociales.set(list);
      },
      error: (err) => {
        console.error('Error al cargar obras sociales:', err);
      }
    });
  }

  cambiarTab(tab: 'turnos' | 'perfil'): void {
    this.tabActiva.set(tab);
  }

  cambiarSubtab(sub: 'proximos' | 'historial'): void {
    this.subtabTurnos.set(sub);
  }

  confirmarCancelacionTurno(turno: Turno): void {
    const fechaLegible = this.formatearFechaLegible(turno.fecha);
    const medicoNombre = `Dr(a). ${turno.medico?.nombre || ''} ${turno.medico?.apellido || ''}`;

    this.confirmModal.confirm({
      titulo: '¿Cancelar Turno Médico?',
      mensaje: `¿Estás seguro de que deseas cancelar tu turno de ${turno.especialidad?.nombre || 'consulta'} con ${medicoNombre} para el día ${fechaLegible} a las ${turno.hora} hs? Esta acción liberará el horario.`,
      tipo: 'danger',
      textoConfirmar: 'Sí, Cancelar Turno',
      textoCancelar: 'Mantener mi Turno'
    }).then((confirmado: boolean) => {
      if (confirmado) {
        this.cancelarTurno(turno.idTurno);
      }
    });
  }

  private cancelarTurno(idTurno: number): void {
    this.turnoService.cancelarMiTurno(idTurno).subscribe({
      next: () => {
        this.turnos.update(actuales => actuales.filter(t => t.idTurno !== idTurno));
        this.notify.success('Tu turno ha sido cancelado con éxito.');
      },
      error: (err) => {
        console.error('Error al cancelar turno:', err);
        this.notify.error(err?.error?.message || 'No se pudo cancelar el turno. Intente nuevamente.');
      }
    });
  }

  guardarPerfil(): void {
    if (!this.perfilForm.nombre.trim() || !this.perfilForm.apellido.trim() || !this.perfilForm.telefono.trim()) {
      this.notify.warning('Por favor complete los campos obligatorios de nombre, apellido y teléfono.');
      return;
    }

    if (!this.perfilForm.idObraSocial) {
      this.notify.warning('Debe seleccionar su cobertura médica u obra social.');
      return;
    }

    this.guardandoPerfil.set(true);

    const dto: ActualizarPerfilPacienteRequest = {
      nombre: this.perfilForm.nombre.trim(),
      apellido: this.perfilForm.apellido.trim(),
      telefono: this.perfilForm.telefono.trim(),
      idObraSocial: this.perfilForm.idObraSocial
    };

    this.pacienteService.actualizarMiPerfil(dto).subscribe({
      next: (actualizado) => {
        this.guardandoPerfil.set(false);
        this.paciente.set(actualizado);
        this.notify.success('¡Tus datos de perfil y cobertura se actualizaron correctamente!');
      },
      error: (err) => {
        this.guardandoPerfil.set(false);
        console.error('Error al actualizar perfil:', err);
        this.notify.error(err?.error?.message || 'Error al comunicarse con el servidor para actualizar el perfil.');
      }
    });
  }

  // --- Helpers de Fecha sin Desplazamiento UTC ---
  getFechaHoyIso(): string {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  obtenerDia(fecha: string): string {
    if (!fecha) return '';
    const partes = fecha.split('-');
    return partes[2] || '';
  }

  obtenerMesAbreviado(fecha: string): string {
    if (!fecha) return '';
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const partes = fecha.split('-');
    const mesIdx = parseInt(partes[1], 10) - 1;
    return meses[mesIdx] || '';
  }

  formatearFechaLegible(fecha: string): string {
    if (!fecha) return '';
    const partes = fecha.split('-');
    if (partes.length < 3) return fecha;

    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const d = new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10));
    const diaSem = diasSemana[d.getDay()];
    const diaNum = partes[2];
    const mesNom = meses[parseInt(partes[1], 10) - 1];
    const anio = partes[0];

    return `${diaSem} ${diaNum} de ${mesNom}, ${anio}`;
  }
}

