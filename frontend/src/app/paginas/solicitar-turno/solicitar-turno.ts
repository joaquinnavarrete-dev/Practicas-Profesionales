import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EspecialidadService } from '../../services/especialidad.service';
import { MedicoService } from '../../services/medico.service';
import { TurnoService } from '../../services/turno.service';
import { PacienteService } from '../../services/paciente.service';
import { AuthService } from '../../services/auth.service';
import { Especialidad, Medico, TurnoDisponible, Turno } from '../../models';

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
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly pasoActual = signal<number>(1);

  readonly especialidades = signal<Especialidad[]>([]);
  readonly cargandoEspecialidades = signal<boolean>(false);

  readonly medicos = signal<Medico[]>([]);
  readonly cargandoMedicos = signal<boolean>(false);
  readonly filtroNombreMedico = signal<string>('');

  readonly turnosDisponibles = signal<TurnoDisponible[]>([]);
  readonly cargandoDisponibles = signal<boolean>(false);

  fechaMinima: string = '';
  readonly cargandoReserva = signal<boolean>(false);
  readonly reservaExitosa = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
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
      }
    });
  }

  seleccionarEspecialidad(esp: Especialidad): void {
    this.turnoBorrador.especialidad = esp;
    this.turnoBorrador.medico = null;
    this.turnoBorrador.hora = '';
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
      }
    });
  }

  seleccionarMedico(med: Medico): void {
    this.turnoBorrador.medico = med;
    this.turnoBorrador.hora = '';
    this.cargarDisponibilidad();
    this.avanzar();
  }

  cargarDisponibilidad(): void {
    if (!this.turnoBorrador.medico || !this.turnoBorrador.fecha) return;

    this.cargandoDisponibles.set(true);
    this.turnoService.consultarDisponibles(this.turnoBorrador.medico.idMedico, this.turnoBorrador.fecha).subscribe({
      next: (slots) => {
        this.turnosDisponibles.set(slots);
        this.cargandoDisponibles.set(false);
      },
      error: (err) => {
        this.cargandoDisponibles.set(false);
        console.error('Error al consultar turnos disponibles:', err);
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
    this.errorMessage.set('');

    if (this.pasoActual() === 1 && !this.turnoBorrador.especialidad) {
      this.errorMessage.set('Debe seleccionar una especialidad para continuar.');
      return;
    }

    if (this.pasoActual() === 2 && !this.turnoBorrador.medico) {
      this.errorMessage.set('Debe seleccionar un profesional médico para continuar.');
      return;
    }

    if (this.pasoActual() === 3 && !this.turnoBorrador.hora) {
      this.errorMessage.set('Debe seleccionar un horario disponible para continuar.');
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
    this.errorMessage.set('');
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
      this.errorMessage.set('');
    }
  }

  confirmarReservaFinal(): void {
    this.errorMessage.set('');

    if (!this.authService.isLoggedIn()) {
      alert('Para confirmar tu turno médico necesitas iniciar sesión o registrarte como paciente.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/turnos/solicitar' } });
      return;
    }

    if (!this.turnoBorrador.medico || !this.turnoBorrador.especialidad || !this.turnoBorrador.fecha || !this.turnoBorrador.hora) {
      this.errorMessage.set('Faltan datos para procesar la reserva del turno.');
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
      },
      error: (err) => {
        this.cargandoReserva.set(false);
        console.error('Error al reservar turno:', err);
        if (err.status === 409) {
          this.errorMessage.set('El horario seleccionado ya fue reservado por otro paciente. Por favor, elija otro turno.');
        } else {
          this.errorMessage.set(err.error?.message || 'Ocurrió un error al confirmar la reserva. Intente nuevamente.');
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
