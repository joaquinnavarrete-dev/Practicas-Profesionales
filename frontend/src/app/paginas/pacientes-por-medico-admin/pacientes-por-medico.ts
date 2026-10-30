import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicoService, TurnoService, NotificationService } from '../../services';
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
  private readonly medicoService = inject(MedicoService);
  private readonly turnoService = inject(TurnoService);
  private readonly notify = inject(NotificationService);

  readonly busquedaGlobal = signal<string>('');
  readonly medicoSeleccionadoId = signal<number>(0);
  readonly fechaFiltro = signal<string>('');
  readonly estadoFiltro = signal<string>('Todos');
  readonly cargando = signal<boolean>(false);

  readonly medicos = signal<MedicoInfo[]>([]);
  readonly pacientes = signal<PacienteCita[]>([]);

  readonly medicoActual = computed(() => {
    const id = Number(this.medicoSeleccionadoId());
    return this.medicos().find(m => m.id === id);
  });

  readonly pacientesFiltrados = computed(() => {
    const query = this.busquedaGlobal().toLowerCase().trim();
    const idMed = Number(this.medicoSeleccionadoId());
    const fFecha = this.fechaFiltro();
    const fEstado = this.estadoFiltro();
    const lista = this.pacientes();

    return lista.filter(p => {
      const coincideMedico = p.medicoId === idMed;
      const coincideFecha = !fFecha || p.fecha === fFecha;
      const coincideEstado = fEstado === 'Todos' || p.estado === fEstado;
      const coincideQuery = !query ||
        p.nombre.toLowerCase().includes(query) ||
        p.dni.includes(query) ||
        p.numHistoriaClinica.toLowerCase().includes(query);

      return coincideMedico && coincideFecha && coincideEstado && coincideQuery;
    });
  });

  ngOnInit(): void {
    this.fechaFiltro.set(new Date().toISOString().split('T')[0]);
    this.cargarMedicos();
  }

  cargarMedicos(): void {
    this.cargando.set(true);
    this.medicoService.listar().subscribe({
      next: (medicosData: Medico[]) => {
        const mapped = medicosData.map(m => ({
          id: m.idMedico,
          nombre: `Dr(a). ${m.nombre} ${m.apellido}`,
          especialidad: m.especialidad?.nombre || 'Medicina General',
          subespecialidad: `Consultorio externo en ${m.especialidad?.nombre || 'General'}`,
          matricula: m.matricula || 'M.N. Registrada',
          consultorio: `Consultorio ${100 + m.idMedico}`,
          fotoUrl: '👨‍⚕️'
        }));
        this.medicos.set(mapped);

        if (mapped.length > 0) {
          this.medicoSeleccionadoId.set(mapped[0].id);
          this.cargarTurnosDelMedico(mapped[0].id);
        } else {
          this.cargando.set(false);
        }
      },
      error: (err: any) => {
        console.error('Error al listar médicos:', err);
        this.cargando.set(false);
      }
    });
  }

  onSeleccionarMedico(idStr: any): void {
    const id = Number(idStr);
    this.medicoSeleccionadoId.set(id);
    this.cargarTurnosDelMedico(id);
  }

  cargarTurnosDelMedico(idMedico: number): void {
    if (!idMedico) return;

    this.cargando.set(true);
    this.turnoService.listarTodos().subscribe({
      next: (turnos: Turno[]) => {
        const turnosDelMedico = turnos.filter(t => t.medico?.idMedico === idMedico);

        const mapped = turnosDelMedico.map(t => {
          const hoy = new Date().toISOString().split('T')[0];
          let estadoCalc: 'Confirmado' | 'En Espera' | 'Atendido' | 'Ausente' = 'Confirmado';
          if (t.fecha < hoy) {
            estadoCalc = 'Atendido';
          } else if (t.fecha === hoy) {
            estadoCalc = 'En Espera';
          }

          return {
            id: t.idTurno,
            medicoId: t.medico?.idMedico || idMedico,
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

        this.pacientes.set(mapped);
        this.cargando.set(false);
      },
      error: (err: any) => {
        console.error('Error al cargar turnos del médico:', err);
        this.pacientes.set([]);
        this.cargando.set(false);
      }
    });
  }

  aplicarFiltros(): void {
    // Computado reactivamente por Signals
  }

  contarPorEstado(estado: string): number {
    const idMed = Number(this.medicoSeleccionadoId());
    return this.pacientes().filter(p => p.medicoId === idMed && p.estado === estado).length;
  }

  resetearFiltros(): void {
    this.busquedaGlobal.set('');
    this.fechaFiltro.set('');
    this.estadoFiltro.set('Todos');
  }

  exportarListado(): void {
    window.print();
  }

  verHistoriaClinica(p: PacienteCita): void {
    this.notify.info(`HC: ${p.numHistoriaClinica} • DNI: ${p.dni} • ${p.obraSocial}`, p.nombre);
  }

  cambiarEstado(p: PacienteCita): void {
    let nuevoEstado: 'Confirmado' | 'En Espera' | 'Atendido' | 'Ausente' = 'Confirmado';
    if (p.estado === 'Confirmado') nuevoEstado = 'En Espera';
    else if (p.estado === 'En Espera') nuevoEstado = 'Atendido';
    else if (p.estado === 'Atendido') nuevoEstado = 'Ausente';
    else nuevoEstado = 'Confirmado';

    this.pacientes.update(lista =>
      lista.map(item => item.id === p.id ? { ...item, estado: nuevoEstado } : item)
    );
    this.notify.info(`Estado del turno actualizado a: ${nuevoEstado}`, p.nombre);
  }
}
