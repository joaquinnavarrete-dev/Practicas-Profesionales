import { Component, OnInit, inject } from '@angular/core';
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

  pasoActual: number = 1;

  especialidades: Especialidad[] = [];
  cargandoEspecialidades: boolean = false;

  medicos: Medico[] = [];
  cargandoMedicos: boolean = false;
  filtroNombreMedico: string = '';

  turnosDisponibles: TurnoDisponible[] = [];
  cargandoDisponibles: boolean = false;

  fechaMinima: string = '';
  cargandoReserva: boolean = false;
  reservaExitosa: boolean = false;
  errorMessage: string = '';
  turnoConfirmado: Turno | null = null;

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
    this.cargandoEspecialidades = true;
    this.especialidadService.listar().subscribe({
      next: (data) => {
        this.especialidades = data;
        this.cargandoEspecialidades = false;
      },
      error: (err) => {
        this.cargandoEspecialidades = false;
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
    this.cargandoMedicos = true;
    this.medicoService.listarPorEspecialidad(idEspecialidad).subscribe({
      next: (data) => {
        this.medicos = data;
        this.cargandoMedicos = false;
      },
      error: (err) => {
        this.cargandoMedicos = false;
        console.error('Error al cargar médicos:', err);
      }
    });
  }

  get medicosFiltrados(): Medico[] {
    const q = this.filtroNombreMedico.toLowerCase().trim();
    if (!q) return this.medicos;
    return this.medicos.filter(m =>
      `${m.nombre} ${m.apellido}`.toLowerCase().includes(q) ||
      m.matricula.toLowerCase().includes(q)
    );
  }

  seleccionarMedico(med: Medico): void {
    this.turnoBorrador.medico = med;
    this.turnoBorrador.hora = '';
    this.cargarDisponibilidad();
    this.avanzar();
  }

  cargarDisponibilidad(): void {
    if (!this.turnoBorrador.medico || !this.turnoBorrador.fecha) return;

    this.cargandoDisponibles = true;
    this.turnoService.consultarDisponibles(this.turnoBorrador.medico.idMedico, this.turnoBorrador.fecha).subscribe({
      next: (slots) => {
        this.turnosDisponibles = slots;
        this.cargandoDisponibles = false;
      },
      error: (err) => {
        this.cargandoDisponibles = false;
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

  get horariosManana(): TurnoDisponible[] {
    return this.turnosDisponibles.filter(s => s.hora < '13:00');
  }

  get horariosTarde(): TurnoDisponible[] {
    return this.turnosDisponibles.filter(s => s.hora >= '13:00');
  }

  get totalDisponibles(): number {
    return this.turnosDisponibles.filter(s => s.disponible).length;
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
    this.errorMessage = '';

    if (this.pasoActual === 1 && !this.turnoBorrador.especialidad) {
      this.errorMessage = 'Debe seleccionar una especialidad para continuar.';
      return;
    }

    if (this.pasoActual === 2 && !this.turnoBorrador.medico) {
      this.errorMessage = 'Debe seleccionar un profesional médico para continuar.';
      return;
    }

    if (this.pasoActual === 3 && !this.turnoBorrador.hora) {
      this.errorMessage = 'Debe seleccionar un horario disponible para continuar.';
      return;
    }

    if (this.pasoActual < 4) {
      this.pasoActual++;
      if (this.pasoActual === 4) {
        this.precargarDatosPaciente();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.confirmarReservaFinal();
    }
  }

  retroceder(): void {
    this.errorMessage = '';
    if (this.pasoActual > 1) {
      this.pasoActual--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.router.navigate(['/']);
    }
  }

  irAlPaso(paso: number): void {
    if (paso < this.pasoActual) {
      this.pasoActual = paso;
      this.errorMessage = '';
    }
  }

  confirmarReservaFinal(): void {
    this.errorMessage = '';

    if (!this.authService.isLoggedIn()) {
      alert('Para confirmar tu turno médico necesitas iniciar sesión o registrarte como paciente.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/turnos/solicitar' } });
      return;
    }

    if (!this.turnoBorrador.medico || !this.turnoBorrador.especialidad || !this.turnoBorrador.fecha || !this.turnoBorrador.hora) {
      this.errorMessage = 'Faltan datos para procesar la reserva del turno.';
      return;
    }

    this.cargandoReserva = true;

    this.turnoService.solicitarMiTurno({
      idMedico: this.turnoBorrador.medico.idMedico,
      idEspecialidad: this.turnoBorrador.especialidad.idEspecialidad,
      fecha: this.turnoBorrador.fecha,
      hora: this.turnoBorrador.hora
    }).subscribe({
      next: (res) => {
        this.cargandoReserva = false;
        this.reservaExitosa = true;
        this.turnoConfirmado = res;
      },
      error: (err) => {
        this.cargandoReserva = false;
        console.error('Error al reservar turno:', err);
        if (err.status === 409) {
          this.errorMessage = 'El horario seleccionado ya fue reservado por otro paciente. Por favor, elija otro turno.';
        } else {
          this.errorMessage = err.error?.message || 'Ocurrió un error al confirmar la reserva. Intente nuevamente.';
        }
      }
    });
  }

  volverAlInicio(): void {
    this.router.navigate(['/']);
  }
}
