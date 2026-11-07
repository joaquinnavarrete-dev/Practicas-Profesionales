import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MedicoService, TurnoService, NotificationService, AuthService } from '../../services';
import { Medico, Turno, MedicoInfo, PacienteCita } from '../../models';
import { AdminTopbarComponent } from '../../componentes/admin-topbar/admin-topbar';

@Component({
  selector: 'app-pacientes-por-medico',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminTopbarComponent],
  templateUrl: './pacientes-por-medico.html',
  styleUrl: './pacientes-por-medico.css'
})
export class PacientesPorMedicoComponent implements OnInit {
  private readonly medicoService = inject(MedicoService);
  private readonly turnoService = inject(TurnoService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  readonly busquedaGlobal = signal<string>('');
  readonly medicoSeleccionadoId = signal<number>(0);
  readonly fechaFiltro = signal<string>('');
  readonly estadoFiltro = signal<string>('Todos');
  readonly cargando = signal<boolean>(false);

  readonly medicos = signal<MedicoInfo[]>([]);
  readonly pacientes = signal<PacienteCita[]>([]);

  readonly medicoActual = computed(() => {
    const id = Number(this.medicoSeleccionadoId());
    if (!id) return undefined;
    return this.medicos().find(m => m.id === id);
  });

  readonly pacientesFiltrados = computed(() => {
    const idMed = Number(this.medicoSeleccionadoId());
    if (!idMed) return [];

    const query = this.busquedaGlobal().toLowerCase().trim();
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
        this.cargando.set(false);

        const currentMedId = this.authService.currentUser()?.idMedico;
        if (this.authService.isMedico() && currentMedId) {
          this.medicoSeleccionadoId.set(currentMedId);
          this.cargarTurnosDelMedico(currentMedId);
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
    if (id > 0) {
      this.cargarTurnosDelMedico(id);
    } else {
      this.pacientes.set([]);
    }
  }

  cargarTurnosDelMedico(idMedico: number): void {
    if (!idMedico) {
      this.pacientes.set([]);
      return;
    }

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
            pacienteId: t.paciente?.idPaciente,
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

  contarPorEstado(estado: string): number {
    const idMed = Number(this.medicoSeleccionadoId());
    return this.pacientes().filter(p => p.medicoId === idMed && p.estado === estado).length;
  }

  resetearFiltros(): void {
    this.busquedaGlobal.set('');
    this.fechaFiltro.set('');
    this.estadoFiltro.set('Todos');
    if (!this.authService.isMedico()) {
      this.medicoSeleccionadoId.set(0);
      this.pacientes.set([]);
    }
  }

  exportarListado(): void {
    window.print();
  }

  verHistoriaClinica(p: PacienteCita): void {
    if (p.pacienteId) {
      this.router.navigate(['/admin/pacientes', p.pacienteId, 'historia-clinica']);
    } else {
      this.notify.info(`HC: ${p.numHistoriaClinica} • DNI: ${p.dni} • ${p.obraSocial}`, p.nombre);
    }
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
