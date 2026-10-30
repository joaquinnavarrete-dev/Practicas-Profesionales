import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TurnoService, MedicoService, PacienteService, AuthService } from '../../services';
import { Turno, Medico, Paciente } from '../../models';

export interface DemandaEspecialidad {
  nombre: string;
  turnos: number;
  porcentaje: number;
  color: string;
}

export interface ProximoTurno {
  hora: string;
  paciente: string;
  dni: string;
  medico: string;
  especialidad: string;
  obraSocial: string;
  estado: 'En Espera' | 'Confirmado' | 'Atendido';
}

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css'
})
export class DashboardAdminComponent implements OnInit {
  private readonly turnoService = inject(TurnoService);
  private readonly medicoService = inject(MedicoService);
  private readonly pacienteService = inject(PacienteService);
  readonly authService = inject(AuthService);

  readonly cargando = signal<boolean>(false);
  fechaHoyTexto: string = '';

  readonly nombreUsuario = computed(() => this.authService.currentUser()?.nombreUsuario || 'Administrador');

  readonly totalTurnos = signal<number>(0);
  readonly totalPacientes = signal<number>(0);
  readonly totalMedicos = signal<number>(0);
  readonly turnosHoyCount = signal<number>(0);
  readonly atendidosHoyCount = signal<number>(0);

  readonly demandaEspecialidades = signal<DemandaEspecialidad[]>([]);
  readonly proximosTurnos = signal<ProximoTurno[]>([]);

  ngOnInit(): void {
    this.formatearFechaHoy();
    this.cargarDatosDashboard();
  }

  private formatearFechaHoy(): void {
    const hoy = new Date();
    const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formato = hoy.toLocaleDateString('es-AR', opciones);
    this.fechaHoyTexto = formato.charAt(0).toUpperCase() + formato.slice(1);
  }

  cargarDatosDashboard(): void {
    this.cargando.set(true);
    const fechaHoyIso = new Date().toISOString().split('T')[0];

    this.medicoService.listar().subscribe({
      next: (medicos: Medico[]) => {
        this.totalMedicos.set(medicos.length);
      },
      error: (err) => console.error('Error al cargar médicos en dashboard:', err)
    });

    this.pacienteService.listar().subscribe({
      next: (pacientes: Paciente[]) => {
        this.totalPacientes.set(pacientes.length);
      },
      error: (err) => console.error('Error al cargar pacientes en dashboard:', err)
    });

    this.turnoService.listarTodos().subscribe({
      next: (turnos: Turno[]) => {
        this.totalTurnos.set(turnos.length);

        const turnosDeHoy = turnos.filter(t => t.fecha === fechaHoyIso);
        this.turnosHoyCount.set(turnosDeHoy.length);

        this.atendidosHoyCount.set(turnos.filter(t => t.fecha < fechaHoyIso).length);

        this.calcularDemandaEspecialidades(turnos);

        const turnosParaTabla = turnosDeHoy.length > 0 ? turnosDeHoy : turnos.slice(-8);
        this.proximosTurnos.set(turnosParaTabla.map(t => ({
          hora: t.hora ? `${t.hora} hs` : '09:00 hs',
          paciente: t.paciente ? `${t.paciente.nombre} ${t.paciente.apellido}` : 'Paciente General',
          dni: t.paciente?.dni || 'Sin DNI',
          medico: t.medico ? `Dr(a). ${t.medico.nombre} ${t.medico.apellido}` : 'Médico de Guardia',
          especialidad: t.medico?.especialidad?.nombre || 'Medicina General',
          obraSocial: t.paciente?.obraSocial?.nombre || 'Particular',
          estado: this.calcularEstadoTurno(t.fecha)
        })));

        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar turnos en dashboard:', err);
        this.cargando.set(false);
      }
    });
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
      const esp = t.medico?.especialidad?.nombre || 'Medicina General';
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

  private calcularEstadoTurno(fechaTurno: string): 'En Espera' | 'Confirmado' | 'Atendido' {
    const hoy = new Date().toISOString().split('T')[0];
    if (fechaTurno < hoy) {
      return 'Atendido';
    } else if (fechaTurno === hoy) {
      return 'En Espera';
    }
    return 'Confirmado';
  }
}
