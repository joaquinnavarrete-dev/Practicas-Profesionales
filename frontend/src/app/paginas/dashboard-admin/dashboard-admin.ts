import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TurnoService, MedicoService, PacienteService, ObraSocialService, AuthService, NotificationService } from '../../services';
import { Turno, Medico, Paciente, ObraSocial, DemandaEspecialidad, ProximoTurno } from '../../models';
import { formatearFecha } from '../../utils/date.utils';
import { AdminTopbarComponent } from '../../componentes/admin-topbar/admin-topbar';
import { HoraFormatoPipe, CoberturaPipe } from '../../pipes';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminTopbarComponent, HoraFormatoPipe, CoberturaPipe],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css'
})
export class DashboardAdminComponent implements OnInit {
  private readonly turnoService = inject(TurnoService);
  private readonly medicoService = inject(MedicoService);
  private readonly pacienteService = inject(PacienteService);
  private readonly obraSocialService = inject(ObraSocialService);
  private readonly notify = inject(NotificationService);
  readonly authService = inject(AuthService);

  readonly cargando = signal<boolean>(false);
  fechaHoyTexto: string = '';

  readonly nombreUsuario = computed(() => {
    const user = this.authService.currentUser();
    return user ? user.nombreUsuario : 'Usuario';
  });

  readonly saludoTitulo = computed(() => {
    const raw = this.nombreUsuario();
    const nombreLimpio = raw.replace(/^(dr\.|dr\s+|dra\.|dra\s+)/i, '');
    if (this.authService.isMedico()) {
      return `¡Bienvenido(a), Dr(a). ${nombreLimpio}! 🩺`;
    }
    if (this.authService.isRecepcionista()) {
      return `¡Hola, ${nombreLimpio}! 👋 (Mesa de Recepción)`;
    }
    return `¡Hola, ${nombreLimpio}! 👋`;
  });

  readonly subtitulo = computed(() => {
    if (this.authService.isMedico()) {
      return 'Resumen de tu consultorio, consultas programadas y pacientes citados en el día.';
    }
    if (this.authService.isRecepcionista()) {
      return 'Control de mostrador en vivo, sala de espera, asignación de turnos y padrón clínico.';
    }
    return 'Resumen operativo integral, estadísticas clínicas y métricas institucionales en tiempo real.';
  });

  readonly medicoTurnosPendientesHoy = signal<number>(0);
  readonly medicoTurnosAtendidosHoy = signal<number>(0);
  readonly medicoConObraSocialHoy = signal<number>(0);
  readonly medicoSinObraSocialHoy = signal<number>(0);
  readonly misTurnosHoy = signal<ProximoTurno[]>([]);

  readonly recepTurnosHoyTotal = signal<number>(0);
  readonly recepTurnosConfirmadosHoy = signal<number>(0);
  readonly recepTurnosCanceladosAusentesHoy = signal<number>(0);
  readonly recepTurnosAtendidosHoy = signal<number>(0);
  readonly turnosRecepcionHoy = signal<ProximoTurno[]>([]);

  readonly adminTotalPacientes = signal<number>(0);
  readonly adminTotalMedicos = signal<number>(0);
  readonly adminTotalObrasSociales = signal<number>(0);
  readonly adminTasaAusentismo = signal<number>(0);
  readonly demandaEspecialidades = signal<DemandaEspecialidad[]>([]);
  readonly proximosTurnosGlobal = signal<ProximoTurno[]>([]);

  ngOnInit(): void {
    this.formatearFechaHoy();
    this.cargarDatosDashboard();
    if (this.authService.isRecepcionista() || this.authService.isAdmin()) {
      this.verificarPendientesReubicacion();
    }
  }

  private verificarPendientesReubicacion(): void {
    this.turnoService.conteoPendientesReubicacion().subscribe({
      next: (res) => {
        const count = res?.conteo || 0;
        if (count > 0 && this.authService.isRecepcionista()) {
          this.notify.warning(`Hay ${count} turno(s) pendiente(s) de reubicación por cambios en la agenda médica de los profesionales.`, 'Atención Reubicación');
        }
      },
      error: (err) => {
        console.error('Error al verificar turnos pendientes de reubicación:', err);
      }
    });
  }

  private formatearFechaHoy(): void {
    this.fechaHoyTexto = formatearFecha(new Date(), 'completa');
  }

  cargarDatosDashboard(): void {
    this.cargando.set(true);
    const fechaHoyIso = new Date().toISOString().split('T')[0];

    this.medicoService.listar().subscribe({
      next: (medicos: Medico[]) => {
        this.adminTotalMedicos.set(medicos.length);
      },
      error: (err) => console.error('Error al cargar médicos en dashboard:', err)
    });

    this.pacienteService.listar().subscribe({
      next: (pacientes: Paciente[]) => {
        this.adminTotalPacientes.set(pacientes.length);
      },
      error: (err) => console.error('Error al cargar pacientes en dashboard:', err)
    });

    this.obraSocialService.listar().subscribe({
      next: (obras: ObraSocial[]) => {
        this.adminTotalObrasSociales.set(obras.length);
      },
      error: (err) => console.error('Error al cargar obras sociales en dashboard:', err)
    });

    this.turnoService.listarTodos().subscribe({
      next: (turnos: Turno[]) => {
        this.procesarMetricasMedico(turnos, fechaHoyIso);
        this.procesarMetricasRecepcionista(turnos, fechaHoyIso);
        this.procesarMetricasAdmin(turnos, fechaHoyIso);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar turnos en dashboard:', err);
        this.cargando.set(false);
      }
    });
  }

  private procesarMetricasMedico(turnos: Turno[], fechaHoyIso: string): void {
    const idMed = this.authService.currentUser()?.idMedico;
    const turnosDelMedico = idMed ? turnos.filter(t => t.medico?.idMedico === idMed) : turnos;
    const misTurnosDeHoy = turnosDelMedico.filter(t => t.fecha === fechaHoyIso);

    const pendientes = misTurnosDeHoy.filter(t => {
      const estado = this.calcularEstadoTurno(t.fecha, t.hora, t.estado);
      return estado === 'Confirmado' || estado === 'En Espera' || estado === 'Pendiente';
    }).length;
    this.medicoTurnosPendientesHoy.set(pendientes);

    const atendidos = misTurnosDeHoy.filter(t => {
      const estado = this.calcularEstadoTurno(t.fecha, t.hora, t.estado);
      return estado === 'Atendido';
    }).length;
    this.medicoTurnosAtendidosHoy.set(atendidos);

    let conOS = 0;
    let sinOS = 0;
    misTurnosDeHoy.forEach(t => {
      const osNombre = t.paciente?.obraSocial?.nombre?.trim().toLowerCase();
      if (osNombre && osNombre !== 'particular' && osNombre !== 'ninguna' && osNombre !== 'sin obra social') {
        conOS++;
      } else {
        sinOS++;
      }
    });
    this.medicoConObraSocialHoy.set(conOS);
    this.medicoSinObraSocialHoy.set(sinOS);

    misTurnosDeHoy.sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));
    this.misTurnosHoy.set(misTurnosDeHoy.map(t => this.mapearAProximoTurno(t)));
  }

  private procesarMetricasRecepcionista(turnos: Turno[], fechaHoyIso: string): void {
    const turnosDeHoy = turnos.filter(t => t.fecha === fechaHoyIso);

    this.recepTurnosHoyTotal.set(turnosDeHoy.length);

    const confirmados = turnosDeHoy.filter(t => {
      const st = this.calcularEstadoTurno(t.fecha, t.hora, t.estado);
      return st === 'Confirmado' || st === 'En Espera';
    }).length;
    this.recepTurnosConfirmadosHoy.set(confirmados);

    const ausentes = turnosDeHoy.filter(t => {
      const st = this.calcularEstadoTurno(t.fecha, t.hora, t.estado);
      return st === 'Ausente' || st === 'Cancelado';
    }).length;
    this.recepTurnosCanceladosAusentesHoy.set(ausentes);

    const atendidos = turnosDeHoy.filter(t => {
      const st = this.calcularEstadoTurno(t.fecha, t.hora, t.estado);
      return st === 'Atendido';
    }).length;
    this.recepTurnosAtendidosHoy.set(atendidos);

    turnosDeHoy.sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));
    this.turnosRecepcionHoy.set(turnosDeHoy.map(t => this.mapearAProximoTurno(t)));
  }

  private procesarMetricasAdmin(turnos: Turno[], fechaHoyIso: string): void {
    if (turnos.length > 0) {
      const turnosAusentes = turnos.filter(t => {
        const st = this.calcularEstadoTurno(t.fecha, t.hora, t.estado);
        return st === 'Ausente';
      }).length;
      const tasa = Math.round((turnosAusentes / turnos.length) * 100);
      this.adminTasaAusentismo.set(tasa);
    } else {
      this.adminTasaAusentismo.set(0);
    }

    this.calcularDemandaEspecialidades(turnos);

    const turnosParaTabla = turnos.filter(t => t.fecha === fechaHoyIso);
    const listaFinal = turnosParaTabla.length > 0 ? turnosParaTabla : turnos.slice(-8);
    this.proximosTurnosGlobal.set(listaFinal.map(t => this.mapearAProximoTurno(t)));
  }

  private mapearAProximoTurno(t: Turno): ProximoTurno {
    return {
      idTurno: t.idTurno,
      idPaciente: t.paciente?.idPaciente,
      hora: t.hora ? `${t.hora} hs` : '09:00 hs',
      paciente: t.paciente ? `${t.paciente.nombre} ${t.paciente.apellido}` : 'Paciente General',
      dni: t.paciente?.dni || 'Sin DNI',
      medico: t.medico ? `Dr(a). ${t.medico.nombre} ${t.medico.apellido}` : 'Médico General',
      especialidad: t.medico?.especialidad?.nombre || t.especialidad?.nombre || 'Medicina General',
      obraSocial: t.paciente?.obraSocial?.sigla || t.paciente?.obraSocial?.nombre || 'Particular',
      obraSocialNombreCompleto: t.paciente?.obraSocial?.nombre || 'Particular',
      estado: this.calcularEstadoTurno(t.fecha, t.hora, t.estado),
      motivo: `Consulta en ${t.especialidad?.nombre || 'General'}`
    };
  }

  private calcularDemandaEspecialidades(turnos: Turno[]): void {
    if (turnos.length === 0) {
      this.demandaEspecialidades.set([
        { nombre: 'Cardiología', turnos: 0, porcentaje: 0, color: '#004b93' },
        { nombre: 'Pediatría', turnos: 0, porcentaje: 0, color: '#0284c7' }
      ]);
      return;
    }

    const conteo: { [esp: string]: number } = {};
    turnos.forEach(t => {
      const esp = t.medico?.especialidad?.nombre || t.especialidad?.nombre || 'Medicina General';
      conteo[esp] = (conteo[esp] || 0) + 1;
    });

    const colores = ['#004b93', '#0284c7', '#0f766e', '#7e22ce', '#eab308', '#dc2626'];
    let idx = 0;

    const lista = Object.keys(conteo).map(esp => {
      const cant = conteo[esp];
      const porcentaje = Math.round((cant / turnos.length) * 100);
      const color = colores[idx % colores.length];
      idx++;
      return {
        nombre: esp,
        turnos: cant,
        porcentaje,
        color
      };
    });

    this.demandaEspecialidades.set(lista);
  }

  private calcularEstadoTurno(fechaTurno: string, horaTurno?: string, estadoActual?: string): string {
    if (estadoActual && estadoActual !== 'Pendiente') {
      return estadoActual;
    }
    const hoy = new Date().toISOString().split('T')[0];
    const ahoraHora = new Date().toTimeString().substring(0, 5);
    if (fechaTurno < hoy || (fechaTurno === hoy && horaTurno && horaTurno < ahoraHora)) {
      return 'Ausente';
    } else if (fechaTurno === hoy) {
      return estadoActual || 'En Espera';
    }
    return estadoActual || 'Confirmado';
  }
}
