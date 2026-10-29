import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicoService, TurnoService } from '../../services';
import { Medico, Turno } from '../../models';

export interface MedicoInfo {
  id: number;
  nombre: string;
  especialidad: string;
  subespecialidad: string;
  matricula: string;
  consultorio: string;
  fotoUrl: string;
}

export interface PacienteCita {
  id: number;
  medicoId: number;
  hora: string;
  nombre: string;
  dni: string;
  numHistoriaClinica: string;
  telefono: string;
  obraSocial: string;
  planAfiliado: string;
  motivo: string;
  estado: 'Confirmado' | 'En Espera' | 'Atendido' | 'Ausente';
  fecha: string;
}

@Component({
  selector: 'app-pacientes-por-medico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes-por-medico.html',
  styleUrl: './pacientes-por-medico.css'
})
export class PacientesPorMedicoComponent implements OnInit {

  busquedaGlobal: string = '';
  medicoSeleccionadoId: number = 0;
  fechaFiltro: string = '';
  estadoFiltro: string = 'Todos';
  cargando: boolean = false;

  medicos: MedicoInfo[] = [];
  pacientes: PacienteCita[] = [];
  medicoActual: MedicoInfo | undefined;
  pacientesFiltrados: PacienteCita[] = [];

  constructor(
    private medicoService: MedicoService,
    private turnoService: TurnoService
  ) { }

  ngOnInit(): void {
    this.fechaFiltro = new Date().toISOString().split('T')[0];
    this.cargarMedicos();
  }

  cargarMedicos(): void {
    this.cargando = true;
    this.medicoService.listar().subscribe({
      next: (medicosData: Medico[]) => {
        this.medicos = medicosData.map(m => ({
          id: m.idMedico,
          nombre: `Dr(a). ${m.nombre} ${m.apellido}`,
          especialidad: m.especialidad?.nombre || 'Medicina General',
          subespecialidad: `Consultorio externo en ${m.especialidad?.nombre || 'General'}`,
          matricula: m.matricula || 'M.N. Registrada',
          consultorio: `Consultorio ${100 + m.idMedico}`,
          fotoUrl: '👨‍⚕️'
        }));

        if (this.medicos.length > 0) {
          this.medicoSeleccionadoId = this.medicos[0].id;
          this.alCambiarMedico();
        } else {
          this.cargando = false;
        }
      },
      error: (err: any) => {
        console.error('Error al listar médicos:', err);
        this.cargando = false;
      }
    });
  }

  alCambiarMedico(): void {
    this.medicoActual = this.medicos.find(m => m.id === Number(this.medicoSeleccionadoId));
    if (!this.medicoSeleccionadoId) return;

    this.cargando = true;
    this.turnoService.listarTodos().subscribe({
      next: (turnos: Turno[]) => {
        const idMed = Number(this.medicoSeleccionadoId);
        const turnosDelMedico = turnos.filter(t => t.medico?.idMedico === idMed);

        this.pacientes = turnosDelMedico.map(t => {
          const hoy = new Date().toISOString().split('T')[0];
          let estadoCalc: 'Confirmado' | 'En Espera' | 'Atendido' | 'Ausente' = 'Confirmado';
          if (t.fecha < hoy) {
            estadoCalc = 'Atendido';
          } else if (t.fecha === hoy) {
            estadoCalc = 'En Espera';
          }

          return {
            id: t.idTurno,
            medicoId: t.medico?.idMedico || idMed,
            hora: t.hora ? `${t.hora} hs` : '09:00 hs',
            nombre: t.paciente ? `${t.paciente.nombre} ${t.paciente.apellido}` : 'Paciente General',
            dni: t.paciente?.dni || 'Sin DNI',
            numHistoriaClinica: `HC-${t.paciente?.idPaciente || t.idTurno}`,
            telefono: t.paciente?.telefono || 'No informado',
            obraSocial: t.paciente?.obraSocial?.nombre || 'Particular',
            planAfiliado: 'Plan Estándar',
            motivo: `Consulta en ${t.especialidad?.nombre || 'General'}`,
            estado: estadoCalc,
            fecha: t.fecha
          };
        });

        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar turnos del médico:', err);
        this.pacientes = [];
        this.aplicarFiltros();
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    const query = this.busquedaGlobal.toLowerCase().trim();

    this.pacientesFiltrados = this.pacientes.filter(p => {
      const coincideMedico = p.medicoId === Number(this.medicoSeleccionadoId);
      const coincideFecha = !this.fechaFiltro || p.fecha === this.fechaFiltro;
      const coincideEstado = this.estadoFiltro === 'Todos' || p.estado === this.estadoFiltro;
      const coincideQuery = !query ||
        p.nombre.toLowerCase().includes(query) ||
        p.dni.includes(query) ||
        p.numHistoriaClinica.toLowerCase().includes(query);

      return coincideMedico && coincideFecha && coincideEstado && coincideQuery;
    });
  }

  contarPorEstado(estado: string): number {
    return this.pacientes.filter(p => p.medicoId === Number(this.medicoSeleccionadoId) && p.estado === estado).length;
  }

  resetearFiltros(): void {
    this.busquedaGlobal = '';
    this.fechaFiltro = '';
    this.estadoFiltro = 'Todos';
    this.aplicarFiltros();
  }

  exportarListado(): void {
    window.print();
  }

  verHistoriaClinica(p: PacienteCita): void {
    alert(`Historia Clínica del Paciente:\nNombre: ${p.nombre}\nDNI: ${p.dni}\nHC: ${p.numHistoriaClinica}\nCobertura: ${p.obraSocial}\nTeléfono: ${p.telefono}`);
  }

  cambiarEstado(p: PacienteCita): void {
    if (p.estado === 'Confirmado') p.estado = 'En Espera';
    else if (p.estado === 'En Espera') p.estado = 'Atendido';
    else if (p.estado === 'Atendido') p.estado = 'Ausente';
    else p.estado = 'Confirmado';
  }

}
