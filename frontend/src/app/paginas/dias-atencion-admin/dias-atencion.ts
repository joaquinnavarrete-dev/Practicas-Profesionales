import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicoService, DiaAtencionService, EspecialidadService, NotificationService, ConfirmModalService } from '../../services';
import { Medico, DiaAtencion, DiaAtencionRequest, Especialidad, HorarioDiaSemana, FranjaDetalle, MedicoAtencion } from '../../models';

@Component({
  selector: 'app-dias-atencion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dias-atencion.html',
  styleUrl: './dias-atencion.css'
})
export class DiasAtencionComponent implements OnInit {
  private readonly medicoService = inject(MedicoService);
  private readonly diaAtencionService = inject(DiaAtencionService);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly notify = inject(NotificationService);
  private readonly confirmModal = inject(ConfirmModalService);

  readonly busquedaGeneral = signal<string>('');
  readonly filtroEspecialidad = signal<string>('Todas');
  readonly filtroDia = signal<string>('Todos');
  readonly cargando = signal<boolean>(false);

  readonly especialidadesList = signal<Especialidad[]>([]);
  readonly medicos = signal<MedicoAtencion[]>([]);

  readonly modalAbierto = signal<boolean>(false);
  readonly medicoSeleccionado = signal<MedicoAtencion | null>(null);
  readonly cargandoAccion = signal<boolean>(false);
  readonly diasEdicion = signal<Array<{
    idDiaAtencion: number;
    diaSemana: string;
    nombreDia: string;
    horaInicio: string;
    horaFin: string;
  }>>([]);

  nuevoDiaForm = {
    diaSemana: '1',
    horaInicio: '08:00',
    horaFin: '13:00'
  };

  readonly DIAS_BASE = [
    { numero: 1, abrev: 'Lun', nombre: 'Lunes' },
    { numero: 2, abrev: 'Mar', nombre: 'Martes' },
    { numero: 3, abrev: 'Mié', nombre: 'Miércoles' },
    { numero: 4, abrev: 'Jue', nombre: 'Jueves' },
    { numero: 5, abrev: 'Vie', nombre: 'Viernes' },
    { numero: 6, abrev: 'Sáb', nombre: 'Sábado' },
    { numero: 7, abrev: 'Dom', nombre: 'Domingo' }
  ];

  readonly listaFiltrada = computed(() => {
    const q = this.busquedaGeneral().toLowerCase().trim();
    const fEsp = this.filtroEspecialidad();
    const fDia = this.filtroDia();
    const lista = this.medicos();

    return lista.filter(m => {
      const matchBusqueda = !q ||
        m.nombre.toLowerCase().includes(q) ||
        m.subespecialidad.toLowerCase().includes(q) ||
        m.especialidad.toLowerCase().includes(q);

      const matchEsp = fEsp === 'Todas' || m.especialidad === fEsp;
      const matchDia = fDia === 'Todos' || m.diasSemana.some(d => d.toLowerCase() === fDia.toLowerCase());

      return matchBusqueda && matchEsp && matchDia;
    });
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);

    this.especialidadService.listar().subscribe({
      next: (esp) => this.especialidadesList.set(esp),
      error: (err) => console.error('Error al listar especialidades:', err)
    });

    this.medicoService.listar().subscribe({
      next: (medicosData: Medico[]) => {
        this.diaAtencionService.listar().subscribe({
          next: (diasData: DiaAtencion[]) => {
            const mapped: MedicoAtencion[] = medicosData.map(m => {
              const diasDelMedico = (diasData || []).filter(d => d.idMedico === m.idMedico);

              const diasSemanaCuadritos: HorarioDiaSemana[] = this.DIAS_BASE.map(base => {
                const matching = diasDelMedico.find(d => this.obtenerNumeroDia(d.diaSemana) === base.numero);
                if (matching) {
                  const hIni = (matching.horaInicio || '').substring(0, 5);
                  const hFin = (matching.horaFin || '').substring(0, 5);
                  return {
                    numero: base.numero,
                    abrev: base.abrev,
                    nombre: base.nombre,
                    activo: true,
                    horario: hIni && hFin ? `${hIni} - ${hFin}` : undefined
                  };
                }
                return {
                  numero: base.numero,
                  abrev: base.abrev,
                  nombre: base.nombre,
                  activo: false
                };
              });

              const franjasDetalle: FranjaDetalle[] = diasDelMedico.map(d => {
                const num = this.obtenerNumeroDia(d.diaSemana);
                const base = this.DIAS_BASE.find(b => b.numero === num);
                const nombreDia = base ? base.nombre : 'Atención';
                const hIni = (d.horaInicio || '').substring(0, 5);
                const hFin = (d.horaFin || '').substring(0, 5);
                return {
                  dia: nombreDia,
                  horas: `${hIni} a ${hFin} hs`
                };
              });

              const diasSemanaNombres = diasSemanaCuadritos
                .filter(c => c.activo)
                .map(c => c.nombre);

              const franjaPrincipal = franjasDetalle.length > 0
                ? franjasDetalle.map(f => `${f.dia} (${f.horas})`).join(' • ')
                : 'Sin horarios configurados';

              return {
                id: m.idMedico,
                nombre: `Dr(a). ${m.nombre} ${m.apellido}`,
                especialidad: m.especialidad?.nombre || 'Medicina General',
                subespecialidad: `Atención y consultorios de ${m.especialidad?.nombre || 'General'}`,
                matricula: m.matricula || 'M.N. Registrada',
                calificacion: 4.8,
                fotoUrl: '👨‍⚕️',
                diasSemana: diasSemanaNombres,
                diasSemanaCuadritos,
                franjasDetalle,
                franjaHoraria: franjaPrincipal,
                consultorio: `Consultorio ${100 + m.idMedico}`,
                proximoDisponible: diasSemanaNombres.length > 0 ? 'Turnos disponibles online' : 'Sin disponibilidad',
                diasAtencionOriginales: diasDelMedico
              };
            });

            this.medicos.set(mapped);
            this.cargando.set(false);
          },
          error: (err) => {
            console.error('Error al listar días de atención:', err);
            this.medicos.set([]);
            this.cargando.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error al listar médicos:', err);
        this.cargando.set(false);
      }
    });
  }

  resetearFiltros(): void {
    this.busquedaGeneral.set('');
    this.filtroEspecialidad.set('Todas');
    this.filtroDia.set('Todos');
  }

  abrirModalGestion(medico: MedicoAtencion): void {
    this.medicoSeleccionado.set(medico);
    this.modalAbierto.set(true);
    this.cargarDiasEdicion(medico.id);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.medicoSeleccionado.set(null);
    this.diasEdicion.set([]);
    this.nuevoDiaForm = {
      diaSemana: '1',
      horaInicio: '08:00',
      horaFin: '13:00'
    };
  }

  cargarDiasEdicion(idMedico: number): void {
    this.cargandoAccion.set(true);
    this.diaAtencionService.buscarPorMedico(idMedico).subscribe({
      next: (dias) => {
        const mapeados = (dias || []).map(d => ({
          idDiaAtencion: d.idDiaAtencion,
          diaSemana: String(d.diaSemana),
          nombreDia: this.obtenerNombreDia(d.diaSemana),
          horaInicio: (d.horaInicio || '').substring(0, 5),
          horaFin: (d.horaFin || '').substring(0, 5)
        }));
        mapeados.sort((a, b) => this.obtenerNumeroDia(a.diaSemana) - this.obtenerNumeroDia(b.diaSemana));
        this.diasEdicion.set(mapeados);
        this.cargandoAccion.set(false);
      },
      error: (err) => {
        this.cargandoAccion.set(false);
        console.error('Error al cargar días del médico:', err);
        this.notify.show('error', 'No se pudieron consultar los días de atención asignados.', 'Error');
      }
    });
  }

  guardarHorarioDia(diaItem: { idDiaAtencion: number; diaSemana: string; nombreDia: string; horaInicio: string; horaFin: string }): void {
    const med = this.medicoSeleccionado();
    if (!med) return;

    if (!diaItem.horaInicio || !diaItem.horaFin) {
      this.notify.show('warning', 'Debe especificar el horario completo.', 'Horario Incompleto');
      return;
    }

    if (diaItem.horaInicio >= diaItem.horaFin) {
      this.notify.show('warning', 'La hora de inicio debe ser anterior a la hora de fin.', 'Horario Inválido');
      return;
    }

    this.cargandoAccion.set(true);
    const dto: DiaAtencionRequest = {
      idMedico: med.id,
      diaSemana: diaItem.diaSemana,
      horaInicio: diaItem.horaInicio.length === 5 ? `${diaItem.horaInicio}:00` : diaItem.horaInicio,
      horaFin: diaItem.horaFin.length === 5 ? `${diaItem.horaFin}:00` : diaItem.horaFin
    };

    this.diaAtencionService.actualizar(diaItem.idDiaAtencion, dto).subscribe({
      next: () => {
        this.cargandoAccion.set(false);
        this.notify.show('success', `Horario de los días ${diaItem.nombreDia} actualizado correctamente.`, 'Horario Modificado');
        this.cargarDatos();
      },
      error: (err) => {
        this.cargandoAccion.set(false);
        console.error('Error al actualizar horario:', err);
        const msg = err.error?.message || 'No se pudo actualizar el horario.';
        this.notify.show('error', msg, 'Error');
      }
    });
  }

  async eliminarDiaAtencion(diaItem: { idDiaAtencion: number; diaSemana: string; nombreDia: string }): Promise<void> {
    const med = this.medicoSeleccionado();
    if (!med) return;

    const confirmado = await this.confirmModal.confirm({
      titulo: '¿Eliminar Día de Atención?',
      mensaje: `¿Confirma que desea quitar la atención de los días ${diaItem.nombreDia} para ${med.nombre}? Esta acción afectará la disponibilidad de turnos.`,
      tipo: 'danger',
      textoConfirmar: 'Eliminar Día',
      textoCancelar: 'Cancelar'
    });

    if (!confirmado) return;

    this.cargandoAccion.set(true);
    this.diaAtencionService.eliminar(diaItem.idDiaAtencion).subscribe({
      next: () => {
        this.cargandoAccion.set(false);
        this.notify.show('success', `Se eliminó la atención de los días ${diaItem.nombreDia}.`, 'Día Eliminado');
        this.diasEdicion.set(this.diasEdicion().filter(d => d.idDiaAtencion !== diaItem.idDiaAtencion));
        this.cargarDatos();
      },
      error: (err) => {
        this.cargandoAccion.set(false);
        console.error('Error al eliminar día de atención:', err);
        this.notify.show('error', 'No se pudo eliminar el día de atención.', 'Error');
      }
    });
  }

  agregarNuevoDia(): void {
    const med = this.medicoSeleccionado();
    if (!med) return;

    if (!this.nuevoDiaForm.horaInicio || !this.nuevoDiaForm.horaFin) {
      this.notify.show('warning', 'Debe especificar tanto hora de inicio como de fin.', 'Horario Incompleto');
      return;
    }

    if (this.nuevoDiaForm.horaInicio >= this.nuevoDiaForm.horaFin) {
      this.notify.show('warning', 'La hora de inicio debe ser anterior a la hora de fin.', 'Horario Inválido');
      return;
    }

    const diaNum = this.obtenerNumeroDia(this.nuevoDiaForm.diaSemana);
    const yaExiste = this.diasEdicion().some(d => this.obtenerNumeroDia(d.diaSemana) === diaNum);
    if (yaExiste) {
      const nombreDia = this.obtenerNombreDia(this.nuevoDiaForm.diaSemana);
      this.notify.show('warning', `El profesional ya tiene configurada atención para los días ${nombreDia}. Modifique el horario existente o elimínelo primero.`, 'Día ya Asignado');
      return;
    }

    this.cargandoAccion.set(true);
    const dto: DiaAtencionRequest = {
      idMedico: med.id,
      diaSemana: this.nuevoDiaForm.diaSemana,
      horaInicio: this.nuevoDiaForm.horaInicio.length === 5 ? `${this.nuevoDiaForm.horaInicio}:00` : this.nuevoDiaForm.horaInicio,
      horaFin: this.nuevoDiaForm.horaFin.length === 5 ? `${this.nuevoDiaForm.horaFin}:00` : this.nuevoDiaForm.horaFin
    };

    this.diaAtencionService.crear(dto).subscribe({
      next: (creado) => {
        this.cargandoAccion.set(false);
        const nombreDia = this.obtenerNombreDia(creado.diaSemana);
        this.notify.show('success', `Se asignó la atención de los días ${nombreDia}.`, 'Día Asignado');
        this.cargarDiasEdicion(med.id);
        this.cargarDatos();
      },
      error: (err) => {
        this.cargandoAccion.set(false);
        console.error('Error al asignar día de atención:', err);
        const msg = err.error?.message || 'No se pudo asignar el día de atención.';
        this.notify.show('error', msg, 'Error');
      }
    });
  }

  obtenerNombreDia(dia: string | number | undefined): string {
    const num = this.obtenerNumeroDia(dia);
    const encontrado = this.DIAS_BASE.find(b => b.numero === num);
    return encontrado ? encontrado.nombre : 'Día ' + dia;
  }

  private obtenerNumeroDia(dia: string | number | undefined): number {
    if (dia === undefined || dia === null) return 0;
    if (typeof dia === 'number') return dia;
    const num = parseInt(dia, 10);
    if (!isNaN(num) && num >= 1 && num <= 7) return num;
    const d = dia.toUpperCase().trim();
    if (d.includes('LUN')) return 1;
    if (d.includes('MAR')) return 2;
    if (d.includes('MIE') || d.includes('MIÉ')) return 3;
    if (d.includes('JUE')) return 4;
    if (d.includes('VIE')) return 5;
    if (d.includes('SAB') || d.includes('SÁB')) return 6;
    if (d.includes('DOM')) return 7;
    return 0;
  }
}
