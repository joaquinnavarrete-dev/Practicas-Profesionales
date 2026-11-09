import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MedicoService, DiaAtencionService, EspecialidadService, AuthService } from '../../services';
import { Medico, DiaAtencion, Especialidad, HorarioCartelera, MedicoCartelera } from '../../models';
import { AdminTopbarComponent } from '../../componentes/admin-topbar/admin-topbar';
import { PaginacionComponent } from '../../componentes/paginacion/paginacion';

@Component({
  selector: 'app-cartelera-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminTopbarComponent, PaginacionComponent],
  templateUrl: './cartelera-medicos.html',
  styleUrl: './cartelera-medicos.css'
})
export class CarteleraMedicosComponent implements OnInit {
  private readonly medicoService = inject(MedicoService);
  private readonly diaAtencionService = inject(DiaAtencionService);
  private readonly especialidadService = inject(EspecialidadService);
  readonly authService = inject(AuthService);

  readonly cargando = signal<boolean>(false);
  readonly busqueda = signal<string>('');
  readonly filtroEspecialidad = signal<string>('Todas');

  readonly paginaActual = signal<number>(1);
  readonly tamanoPagina = signal<number>(10);

  readonly especialidades = signal<Especialidad[]>([]);
  readonly cartelera = signal<MedicoCartelera[]>([]);

  readonly carteleraFiltrada = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const esp = this.filtroEspecialidad();
    const lista = this.cartelera();

    return lista.filter(m => {
      const matchEsp = esp === 'Todas' || m.especialidad === esp;
      const matchQuery = !q ||
        m.nombreCompleto.toLowerCase().includes(q) ||
        m.especialidad.toLowerCase().includes(q) ||
        m.consultorio.toLowerCase().includes(q);

      return matchEsp && matchQuery;
    });
  });

  readonly carteleraPaginada = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina();
    return this.carteleraFiltrada().slice(inicio, inicio + this.tamanoPagina());
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);

    this.especialidadService.listar().subscribe({
      next: (espList) => this.especialidades.set(espList),
      error: (err) => console.error('Error al listar especialidades:', err)
    });

    this.medicoService.listar().subscribe({
      next: (medicos: Medico[]) => {
        this.diaAtencionService.listar().subscribe({
          next: (dias: DiaAtencion[]) => {
            const nombresDias = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

            const resultado: MedicoCartelera[] = medicos.map(m => {
              const diasDelMed = dias
                .filter(d => d.idMedico === m.idMedico)
                .sort((a, b) => Number(a.diaSemana) - Number(b.diaSemana));

              const horarios: HorarioCartelera[] = diasDelMed.map(d => ({
                diaNombre: nombresDias[Number(d.diaSemana)] || d.diaSemana,
                horaInicio: d.horaInicio ? d.horaInicio.substring(0, 5) : '08:00',
                horaFin: d.horaFin ? d.horaFin.substring(0, 5) : '12:00'
              }));

              return {
                idMedico: m.idMedico,
                nombreCompleto: `Dr(a). ${m.nombre} ${m.apellido}`,
                especialidad: m.especialidad?.nombre || 'Medicina General',
                consultorio: `Consultorio ${100 + m.idMedico}`,
                telefono: m.telefono || 'Sin teléfono',
                horarios
              };
            });

            this.cartelera.set(resultado);
            this.cargando.set(false);
          },
          error: (err) => {
            console.error('Error al listar horarios en cartelera:', err);
            this.cargando.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error al listar médicos en cartelera:', err);
        this.cargando.set(false);
      }
    });
  }
}

