import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MedicoService, DiaAtencionService, EspecialidadService } from '../../services';
import { Medico, DiaAtencion, Especialidad } from '../../models';

export interface HorarioDiaSemana {
  numero: number;
  abrev: string;
  nombre: string;
  activo: boolean;
  horario?: string;
}

export interface FranjaDetalle {
  dia: string;
  horas: string;
}

export interface MedicoAtencion {
  id: number;
  nombre: string;
  especialidad: string;
  subespecialidad: string;
  matricula: string;
  calificacion: number;
  fotoUrl: string;
  diasSemana: string[];
  diasSemanaCuadritos: HorarioDiaSemana[];
  franjasDetalle: FranjaDetalle[];
  franjaHoraria: string;
  consultorio: string;
  proximoDisponible: string;
}

@Component({
  selector: 'app-dias-atencion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dias-atencion.html',
  styleUrl: './dias-atencion.css'
})
export class DiasAtencionComponent implements OnInit {
  private readonly medicoService = inject(MedicoService);
  private readonly diaAtencionService = inject(DiaAtencionService);
  private readonly especialidadService = inject(EspecialidadService);

  readonly busquedaGeneral = signal<string>('');
  readonly filtroEspecialidad = signal<string>('Todas');
  readonly filtroDia = signal<string>('Todos');
  readonly cargando = signal<boolean>(false);

  readonly especialidadesList = signal<Especialidad[]>([]);
  readonly medicos = signal<MedicoAtencion[]>([]);

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
                proximoDisponible: diasSemanaNombres.length > 0 ? 'Turnos disponibles online' : 'Sin disponibilidad'
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
