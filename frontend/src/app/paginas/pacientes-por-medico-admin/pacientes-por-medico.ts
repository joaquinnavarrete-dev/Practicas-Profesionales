import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MedicoService, TurnoService, HistoriaClinicaService, NotificationService, AuthService } from '../../services';
import { Medico, Turno, MedicoInfo, PacienteCita } from '../../models';
import { AdminTopbarComponent } from '../../componentes/admin-topbar/admin-topbar';
import { PaginacionComponent } from '../../componentes/paginacion/paginacion';
import { HoraFormatoPipe, CoberturaPipe } from '../../pipes';

@Component({
  selector: 'app-pacientes-por-medico',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminTopbarComponent, PaginacionComponent, HoraFormatoPipe, CoberturaPipe],
  templateUrl: './pacientes-por-medico.html',
  styleUrl: './pacientes-por-medico.css'
})
export class PacientesPorMedicoComponent implements OnInit {
  private readonly medicoService = inject(MedicoService);
  private readonly turnoService = inject(TurnoService);
  private readonly historiaClinicaService = inject(HistoriaClinicaService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  readonly busquedaGlobal = signal<string>('');
  readonly medicoSeleccionadoId = signal<number>(0);
  readonly fechaFiltro = signal<string>('');
  readonly estadoFiltro = signal<string>('Todos');

  readonly paginaActual = signal<number>(1);
  readonly tamanoPagina = signal<number>(10);

  readonly cargando = signal<boolean>(false);

  readonly medicos = signal<MedicoInfo[]>([]);
  readonly pacientes = signal<PacienteCita[]>([]);

  readonly modalAtencionAbierto = signal<boolean>(false);
  readonly pacienteSeleccionado = signal<PacienteCita | null>(null);
  readonly guardandoAtencion = signal<boolean>(false);

  nuevoEstado: string = 'Atendido';
  motivoConsulta: string = '';
  diagnostico: string = '';
  tratamiento: string = '';
  observaciones: string = '';

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
      let coincideEstado = false;
      if (fEstado === 'Todos') {
        coincideEstado = this.authService.isMedico() ? p.estado !== 'Pendiente' : true;
      } else {
        coincideEstado = p.estado === fEstado;
      }
      const coincideQuery = !query ||
        p.nombre.toLowerCase().includes(query) ||
        p.dni.includes(query) ||
        p.numHistoriaClinica.toLowerCase().includes(query);

      return coincideMedico && coincideFecha && coincideEstado && coincideQuery;
    });
  });

  readonly pacientesPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina();
    return this.pacientesFiltrados().slice(inicio, inicio + this.tamanoPagina());
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
            estado: t.estado || 'Confirmado',
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
    this.paginaActual.set(1);
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

  abrirModalAtencion(p: PacienteCita): void {
    this.pacienteSeleccionado.set(p);
    this.nuevoEstado = p.estado === 'Pendiente' ? 'Confirmado' : (p.estado === 'Confirmado' ? 'Atendido' : p.estado);
    this.motivoConsulta = p.motivo || 'Consulta médica de control';
    this.diagnostico = '';
    this.tratamiento = '';
    this.observaciones = '';
    this.modalAtencionAbierto.set(true);
  }

  cerrarModalAtencion(): void {
    this.modalAtencionAbierto.set(false);
    this.pacienteSeleccionado.set(null);
  }

  guardarAtencion(): void {
    const p = this.pacienteSeleccionado();
    if (!p) return;

    if (this.nuevoEstado === 'Atendido' && !this.diagnostico.trim()) {
      this.notify.warning('Para marcar el turno como Atendido debe ingresar el Diagnóstico médico.', 'Diagnóstico Requerido');
      return;
    }

    this.guardandoAtencion.set(true);

    this.turnoService.cambiarEstado(p.id, this.nuevoEstado).subscribe({
      next: () => {
        if (this.nuevoEstado === 'Atendido' && p.pacienteId) {
          this.historiaClinicaService.crear({
            idPaciente: p.pacienteId,
            idMedico: p.medicoId,
            idTurno: p.id,
            fecha: p.fecha || new Date().toISOString().split('T')[0],
            motivoConsulta: this.motivoConsulta.trim() || 'Consulta médica',
            diagnostico: this.diagnostico.trim(),
            tratamiento: this.tratamiento.trim() || undefined,
            observaciones: this.observaciones.trim() || undefined
          }).subscribe({
            next: () => {
              this.guardandoAtencion.set(false);
              this.cerrarModalAtencion();
              this.pacientes.update(lista =>
                lista.map(item => item.id === p.id ? { ...item, estado: this.nuevoEstado } : item)
              );
              this.notify.success(
                `Turno marcado como Atendido y consulta asentada en la Historia Clínica de ${p.nombre}.`,
                'Atención Guardada'
              );
            },
            error: (errHc) => {
              this.guardandoAtencion.set(false);
              this.cerrarModalAtencion();
              this.pacientes.update(lista =>
                lista.map(item => item.id === p.id ? { ...item, estado: this.nuevoEstado } : item)
              );
              console.error('Error al guardar en historia clínica:', errHc);
              this.notify.warning('El turno se marcó como Atendido, pero hubo un error al guardar en la Historia Clínica.', 'Atención Guardada');
            }
          });
        } else {
          this.guardandoAtencion.set(false);
          this.cerrarModalAtencion();
          this.pacientes.update(lista =>
            lista.map(item => item.id === p.id ? { ...item, estado: this.nuevoEstado } : item)
          );
          this.notify.success(`Estado del turno actualizado a: ${this.nuevoEstado}`, p.nombre);
        }
      },
      error: (err) => {
        this.guardandoAtencion.set(false);
        console.error('Error al actualizar estado del turno:', err);
        this.notify.error(err.error?.message || 'No se pudo actualizar el estado del turno.', 'Error');
      }
    });
  }
}
