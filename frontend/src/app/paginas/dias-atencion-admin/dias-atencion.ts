import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MedicoService, DiaAtencionService, EspecialidadService } from '../../services';
import { Medico, DiaAtencion, Especialidad } from '../../models';

interface MedicoAtencion {
  id: number;
  nombre: string;
  especialidad: string;
  subespecialidad: string;
  matricula: string;
  calificacion: number;
  fotoUrl: string;
  diasSemana: string[];
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
            const mapped = medicosData.map(m => {
              const diasDelMedico = diasData.filter(d => d.idMedico === m.idMedico);
              const diasSemana = diasDelMedico.length > 0
                ? diasDelMedico.map(d => this.capitalizar(d.diaSemana))
                : ['Lunes', 'Miércoles', 'Viernes'];

              const franja = diasDelMedico.length > 0
                ? `${diasDelMedico[0].horaInicio} a ${diasDelMedico[0].horaFin} hs`
                : '08:00 a 13:00 hs';

              return {
                id: m.idMedico,
                nombre: `Dr(a). ${m.nombre} ${m.apellido}`,
                especialidad: m.especialidad?.nombre || 'Medicina General',
                subespecialidad: `Atención clínica y consultorios externos en ${m.especialidad?.nombre || 'General'}`,
                matricula: m.matricula || 'M.N. Registrada',
                calificacion: 4.8,
                fotoUrl: '👨‍⚕️',
                diasSemana,
                franjaHoraria: franja,
                consultorio: `Consultorio ${100 + m.idMedico}`,
                proximoDisponible: 'Turnos disponibles online'
              };
            });

            this.medicos.set(mapped);
            this.cargando.set(false);
          },
          error: (err) => {
            console.error('Error al listar días de atención:', err);
            const mapped = medicosData.map(m => ({
              id: m.idMedico,
              nombre: `Dr(a). ${m.nombre} ${m.apellido}`,
              especialidad: m.especialidad?.nombre || 'Medicina General',
              subespecialidad: `Atención ambulatoria`,
              matricula: m.matricula || 'M.N. Registrada',
              calificacion: 4.8,
              fotoUrl: '👨‍⚕️',
              diasSemana: ['Lunes', 'Miércoles', 'Viernes'],
              franjaHoraria: '08:00 a 13:00 hs',
              consultorio: `Consultorio ${100 + m.idMedico}`,
              proximoDisponible: 'Consultar agenda'
            }));
            this.medicos.set(mapped);
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

  filtrar(): void {
    // Computado reactivamente por Signals
  }

  resetearFiltros(): void {
    this.busquedaGeneral.set('');
    this.filtroEspecialidad.set('Todas');
    this.filtroDia.set('Todos');
  }

  private capitalizar(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
