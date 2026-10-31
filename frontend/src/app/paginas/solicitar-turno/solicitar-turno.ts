import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EspecialidadService } from '../../services/especialidad.service';
import { MedicoService } from '../../services/medico.service';
import { TurnoService } from '../../services/turno.service';
import { PacienteService } from '../../services/paciente.service';
import { DiaAtencionService } from '../../services/dia-atencion.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Especialidad, Medico, TurnoDisponible, Turno, DiaAtencion } from '../../models';

export interface DiaCalendario {
  fechaStr: string;
  numeroDia: number;
  esMesActual: boolean;
  esPasado: boolean;
  esHoy: boolean;
  atiendeMedico: boolean;
  estaSeleccionado: boolean;
}

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './solicitar-turno.html',
  styleUrl: './solicitar-turno.css'
})
export class SolicitarTurnoComponent implements OnInit {
  private readonly especialidadService = inject(EspecialidadService);
  private readonly medicoService = inject(MedicoService);
  private readonly turnoService = inject(TurnoService);
  private readonly pacienteService = inject(PacienteService);
  private readonly diaAtencionService = inject(DiaAtencionService);
  private readonly notify = inject(NotificationService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly pasoActual = signal<number>(1);

  readonly especialidades = signal<Especialidad[]>([]);
  readonly cargandoEspecialidades = signal<boolean>(false);

  readonly medicos = signal<Medico[]>([]);
  readonly cargandoMedicos = signal<boolean>(false);
  readonly filtroNombreMedico = signal<string>('');

  readonly diasAtencionMedico = signal<DiaAtencion[]>([]);
  readonly cargandoDiasAtencion = signal<boolean>(false);
  readonly fechaMesVisual = signal<Date>(new Date());

  readonly turnosDisponibles = signal<TurnoDisponible[]>([]);
  readonly cargandoDisponibles = signal<boolean>(false);

  fechaMinima: string = '';
  readonly cargandoReserva = signal<boolean>(false);
  readonly reservaExitosa = signal<boolean>(false);
  readonly turnoConfirmado = signal<Turno | null>(null);

  readonly medicosFiltrados = computed(() => {
    const q = this.filtroNombreMedico().toLowerCase().trim();
    const lista = this.medicos();
    if (!q) return lista;
    return lista.filter(m =>
      `${m.nombre} ${m.apellido}`.toLowerCase().includes(q) ||
      m.matricula.toLowerCase().includes(q)
    );
  });

  readonly diasSemanaAtencion = computed(() => {
    return new Set(this.diasAtencionMedico().map(d => Number(d.diaSemana)));
  });

  readonly nombreMesVisual = computed(() => {
    const d = this.fechaMesVisual();
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${meses[d.getMonth()]} ${d.getFullYear()}`;
  });

  readonly puedeRetrocederMes = computed(() => {
    const visual = this.fechaMesVisual();
    const hoy = new Date();
    return visual.getFullYear() > hoy.getFullYear() ||
      (visual.getFullYear() === hoy.getFullYear() && visual.getMonth() > hoy.getMonth());
  });

  readonly diasCalendario = computed<DiaCalendario[]>(() => {
    const mesVisual = this.fechaMesVisual();
    const year = mesVisual.getFullYear();
    const month = mesVisual.getMonth();

    const hoy = new Date();
    const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

    const diasSet = this.diasSemanaAtencion();
    const fechaSeleccionada = this.turnoBorrador.fecha;

    const primerDiaMes = new Date(year, month, 1);
    const diaSemanaInicio = primerDiaMes.getDay() === 0 ? 7 : primerDiaMes.getDay();

    const diasTotalesMes = new Date(year, month + 1, 0).getDate();
    const diasMesAnterior = new Date(year, month, 0).getDate();

    const dias: DiaCalendario[] = [];

    const paddingInicio = diaSemanaInicio - 1;
    for (let i = paddingInicio - 1; i >= 0; i--) {
      const numDia = diasMesAnterior - i;
      const prevDate = new Date(year, month - 1, numDia);
      const fechaStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(numDia).padStart(2, '0')}`;
      dias.push({
        fechaStr,
        numeroDia: numDia,
        esMesActual: false,
        esPasado: true,
        esHoy: false,
        atiendeMedico: false,
        estaSeleccionado: false
      });
    }

    for (let d = 1; d <= diasTotalesMes; d++) {
      const fechaDia = new Date(year, month, d);
      const isoDay = fechaDia.getDay() === 0 ? 7 : fechaDia.getDay();
      const fechaStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const esPasado = fechaStr < hoyStr;
      const esHoy = fechaStr === hoyStr;
      const atiende = diasSet.has(isoDay) && !esPasado;
      const estaSeleccionado = fechaStr === fechaSeleccionada;

      dias.push({
        fechaStr,
        numeroDia: d,
        esMesActual: true,
        esPasado,
        esHoy,
        atiendeMedico: atiende,
        estaSeleccionado
      });
    }

    const celdasFaltantes = (7 - (dias.length % 7)) % 7;
    for (let nextDay = 1; nextDay <= celdasFaltantes; nextDay++) {
      const nextDate = new Date(year, month + 1, nextDay);
      const fechaStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;
      dias.push({
        fechaStr,
        numeroDia: nextDay,
        esMesActual: false,
        esPasado: false,
        esHoy: false,
        atiendeMedico: false,
        estaSeleccionado: false
      });
    }

    return dias;
  });

  readonly horariosManana = computed(() => {
    return this.turnosDisponibles().filter(s => s.hora < '13:00');
  });

  readonly horariosTarde = computed(() => {
    return this.turnosDisponibles().filter(s => s.hora >= '13:00');
  });

  readonly totalDisponibles = computed(() => {
    return this.turnosDisponibles().filter(s => s.disponible).length;
  });

  turnoBorrador = {
    especialidad: null as Especialidad | null,
    medico: null as Medico | null,
    fecha: '',
    hora: '',
    modalidad: 'Presencial',
    sede: 'Sede Central (Av. San Gabriel 1420)',
    pacienteNombre: '',
    pacienteDni: '',
    pacienteTelefono: '',
    pacienteEmail: '',
    obraSocial: 'Particular',
    afiliadoNro: 'Titular',
    copago: '$0 (Cubierto al 100%)',
    motivoConsulta: '',
    recordatorioWhatsapp: true,
    comprobanteEmail: true
  };

  ngOnInit(): void {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    this.fechaMinima = `${yyyy}-${mm}-${dd}`;
    this.turnoBorrador.fecha = this.fechaMinima;
    this.fechaMesVisual.set(new Date(hoy.getFullYear(), hoy.getMonth(), 1));

    this.cargarEspecialidades();
    this.precargarDatosPaciente();
  }

  cargarEspecialidades(): void {
    this.cargandoEspecialidades.set(true);
    this.especialidadService.listar().subscribe({
      next: (data) => {
        this.especialidades.set(data);
        this.cargandoEspecialidades.set(false);
      },
      error: (err) => {
        this.cargandoEspecialidades.set(false);
        console.error('Error al cargar especialidades:', err);
        this.notify.error('No se pudo cargar la cartilla de especialidades.', 'Error de Carga');
      }
    });
  }

  seleccionarEspecialidad(esp: Especialidad): void {
    this.turnoBorrador.especialidad = esp;
    this.turnoBorrador.medico = null;
    this.turnoBorrador.hora = '';
    this.diasAtencionMedico.set([]);
    this.turnosDisponibles.set([]);
    this.cargarMedicosPorEspecialidad(esp.idEspecialidad);
    this.avanzar();
  }

  getIconoEspecialidad(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('cardio')) return '💙';
    if (n.includes('pedia')) return '🍼';
    if (n.includes('neuro')) return '🧠';
    if (n.includes('oftalmo')) return '👁️';
    if (n.includes('psico')) return '🧩';
    if (n.includes('odonto')) return '🦷';
    if (n.includes('trauma')) return '🦴';
    if (n.includes('derma')) return '🩺';
    if (n.includes('gineco')) return '🌸';
    return '⚕️';
  }

  cargarMedicosPorEspecialidad(idEspecialidad: number): void {
    this.cargandoMedicos.set(true);
    this.medicoService.listarPorEspecialidad(idEspecialidad).subscribe({
      next: (data) => {
        this.medicos.set(data);
        this.cargandoMedicos.set(false);
      },
      error: (err) => {
        this.cargandoMedicos.set(false);
        console.error('Error al cargar médicos:', err);
        this.notify.error('No se pudieron obtener los médicos para la especialidad seleccionada.', 'Error de Carga');
      }
    });
  }

  seleccionarMedico(med: Medico): void {
    this.turnoBorrador.medico = med;
    this.turnoBorrador.hora = '';
    this.cargarDiasAtencionMedico(med.idMedico);
    this.avanzar();
  }

  cargarDiasAtencionMedico(idMedico: number): void {
    this.cargandoDiasAtencion.set(true);
    this.diaAtencionService.buscarPorMedico(idMedico).subscribe({
      next: (dias) => {
        this.diasAtencionMedico.set(dias);
        this.cargandoDiasAtencion.set(false);
        this.autoSeleccionarPrimerDiaDisponible(dias);
      },
      error: (err) => {
        this.cargandoDiasAtencion.set(false);
        console.error('Error al cargar días de atención:', err);
        this.cargarDisponibilidad();
      }
    });
  }

  autoSeleccionarPrimerDiaDisponible(dias: DiaAtencion[]): void {
    if (!dias || dias.length === 0) {
      this.cargarDisponibilidad();
      return;
    }
    const diasSet = new Set(dias.map(d => Number(d.diaSemana)));
    const hoy = new Date();
    let seleccionado = false;

    for (let i = 0; i < 35; i++) {
      const candidato = new Date(hoy);
      candidato.setDate(hoy.getDate() + i);
      const iso = candidato.getDay() === 0 ? 7 : candidato.getDay();
      if (diasSet.has(iso)) {
        const yyyy = candidato.getFullYear();
        const mm = String(candidato.getMonth() + 1).padStart(2, '0');
        const dd = String(candidato.getDate()).padStart(2, '0');
        const fechaStr = `${yyyy}-${mm}-${dd}`;
        this.turnoBorrador.fecha = fechaStr;
        this.fechaMesVisual.set(new Date(candidato.getFullYear(), candidato.getMonth(), 1));
        seleccionado = true;
        break;
      }
    }

    if (!seleccionado) {
      this.turnoBorrador.fecha = this.fechaMinima;
    }

    this.cargarDisponibilidad();
  }

  mesAnterior(): void {
    if (!this.puedeRetrocederMes()) return;
    const cur = this.fechaMesVisual();
    this.fechaMesVisual.set(new Date(cur.getFullYear(), cur.getMonth() - 1, 1));
  }

  mesSiguiente(): void {
    const cur = this.fechaMesVisual();
    this.fechaMesVisual.set(new Date(cur.getFullYear(), cur.getMonth() + 1, 1));
  }

  seleccionarDiaCalendario(dia: DiaCalendario): void {
    if (dia.esPasado || !dia.esMesActual || !dia.atiendeMedico) return;
    this.turnoBorrador.fecha = dia.fechaStr;
    this.turnoBorrador.hora = '';
    this.cargarDisponibilidad();
  }

  onFechaManualCambio(nuevaFecha: string): void {
    this.turnoBorrador.fecha = nuevaFecha;
    this.turnoBorrador.hora = '';
    if (nuevaFecha) {
      const partes = nuevaFecha.split('-');
      if (partes.length === 3) {
        this.fechaMesVisual.set(new Date(Number(partes[0]), Number(partes[1]) - 1, 1));
      }
    }
    this.cargarDisponibilidad();
  }

  getTooltipDia(dia: DiaCalendario): string {
    if (!dia.esMesActual) return '';
    if (dia.esPasado) return 'Fecha anterior a hoy';
    if (dia.atiendeMedico) return `Atención disponible (${dia.fechaStr})`;
    return 'El profesional no atiende este día';
  }

  getNombreDiaSemana(diaNumero: string | number): string {
    const map: Record<string, string> = {
      '1': 'Lunes',
      '2': 'Martes',
      '3': 'Miércoles',
      '4': 'Jueves',
      '5': 'Viernes',
      '6': 'Sábado',
      '7': 'Domingo'
    };
    return map[String(diaNumero)] || `Día ${diaNumero}`;
  }

  cargarDisponibilidad(): void {
    if (!this.turnoBorrador.medico || !this.turnoBorrador.fecha) return;

    this.cargandoDisponibles.set(true);
    this.turnoService.consultarDisponibles(this.turnoBorrador.medico.idMedico, this.turnoBorrador.fecha).subscribe({
      next: (slots) => {
        const formateados = (slots || []).map(s => ({
          ...s,
          hora: typeof s.hora === 'string' && s.hora.length > 5 ? s.hora.substring(0, 5) : s.hora,
          disponible: s.disponible !== undefined ? Boolean(s.disponible) : true
        }));
        this.turnosDisponibles.set(formateados);
        this.cargandoDisponibles.set(false);
      },
      error: (err) => {
        this.cargandoDisponibles.set(false);
        console.error('Error al consultar turnos disponibles:', err);
        this.notify.error('No se pudieron consultar los horarios disponibles.', 'Error');
      }
    });
  }

  onFechaCambio(): void {
    this.turnoBorrador.hora = '';
    this.cargarDisponibilidad();
  }

  seleccionarHorario(h: TurnoDisponible): void {
    if (!h.disponible) return;
    this.turnoBorrador.hora = h.hora;
  }

  precargarDatosPaciente(): void {
    if (this.authService.isLoggedIn() && this.authService.isPaciente()) {
      this.pacienteService.obtenerMiPerfil().subscribe({
        next: (p) => {
          this.turnoBorrador.pacienteNombre = `${p.nombre} ${p.apellido}`;
          this.turnoBorrador.pacienteDni = p.dni;
          this.turnoBorrador.pacienteTelefono = p.telefono;
          this.turnoBorrador.pacienteEmail = this.authService.currentUser()?.nombreUsuario || '';
          this.turnoBorrador.obraSocial = p.obraSocial ? p.obraSocial.nombre : 'Particular';
        },
        error: (err) => {
          console.warn('No se pudo precargar el perfil del paciente:', err);
        }
      });
    }
  }

  avanzar(): void {
    if (this.pasoActual() === 1 && !this.turnoBorrador.especialidad) {
      this.notify.warning('Debe seleccionar una especialidad médica para continuar.', 'Especialidad requerida');
      return;
    }

    if (this.pasoActual() === 2 && !this.turnoBorrador.medico) {
      this.notify.warning('Debe seleccionar un profesional médico para continuar.', 'Profesional requerido');
      return;
    }

    if (this.pasoActual() === 3 && !this.turnoBorrador.hora) {
      this.notify.warning('Debe seleccionar un horario disponible para continuar.', 'Horario no seleccionado');
      return;
    }

    if (this.pasoActual() < 4) {
      this.pasoActual.update(p => p + 1);
      if (this.pasoActual() === 4) {
        this.precargarDatosPaciente();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.confirmarReservaFinal();
    }
  }

  retroceder(): void {
    if (this.pasoActual() > 1) {
      this.pasoActual.update(p => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.router.navigate(['/']);
    }
  }

  irAlPaso(paso: number): void {
    if (paso < this.pasoActual()) {
      this.pasoActual.set(paso);
    }
  }

  confirmarReservaFinal(): void {
    if (!this.authService.isLoggedIn()) {
      this.notify.warning('Para confirmar tu turno médico necesitas iniciar sesión o registrarte como paciente.', 'Acceso requerido');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/turnos/solicitar' } });
      return;
    }

    if (!this.turnoBorrador.medico || !this.turnoBorrador.especialidad || !this.turnoBorrador.fecha || !this.turnoBorrador.hora) {
      this.notify.warning('Faltan datos obligatorios para procesar la reserva del turno.', 'Datos incompletos');
      return;
    }

    this.cargandoReserva.set(true);

    this.turnoService.solicitarMiTurno({
      idMedico: this.turnoBorrador.medico.idMedico,
      idEspecialidad: this.turnoBorrador.especialidad.idEspecialidad,
      fecha: this.turnoBorrador.fecha,
      hora: this.turnoBorrador.hora
    }).subscribe({
      next: (res) => {
        this.cargandoReserva.set(false);
        this.reservaExitosa.set(true);
        this.turnoConfirmado.set(res);
        this.notify.success('Tu cita médica ha sido agendada con éxito.', '¡Turno Confirmado!');
      },
      error: (err) => {
        this.cargandoReserva.set(false);
        console.error('Error al reservar turno:', err);
        if (err.status === 409) {
          this.notify.warning('El horario seleccionado ya fue reservado por otro paciente. Por favor, elija otro turno.', 'Turno no disponible');
        } else {
          this.notify.error(err.error?.message || 'Ocurrió un error al confirmar la reserva. Intente nuevamente.', 'Error al reservar');
        }
      }
    });
  }

  actualizarFiltroMedico(valor: string): void {
    this.filtroNombreMedico.set(valor);
  }

  volverAlInicio(): void {
    this.router.navigate(['/']);
  }
}
