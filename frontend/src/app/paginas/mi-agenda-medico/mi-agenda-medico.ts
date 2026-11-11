import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TurnoService, AuthService } from '../../services';
import { Turno, DiaAgendaSemanal } from '../../models';
import { AdminTopbarComponent } from '../../componentes/admin-topbar/admin-topbar';
import { HoraFormatoPipe, CoberturaPipe } from '../../pipes';

@Component({
  selector: 'app-mi-agenda-medico',
  standalone: true,
  imports: [CommonModule, AdminTopbarComponent, HoraFormatoPipe, CoberturaPipe],
  templateUrl: './mi-agenda-medico.html',
  styleUrl: './mi-agenda-medico.css'
})
export class MiAgendaMedicoComponent implements OnInit {
  private readonly turnoService = inject(TurnoService);
  readonly authService = inject(AuthService);

  readonly cargando = signal<boolean>(false);
  readonly turnosMedico = signal<Turno[]>([]);
  readonly semanaOffset = signal<number>(0);

  readonly rangoSemanaTexto = computed(() => {
    const { inicio, fin } = this.obtenerLimitesSemana(this.semanaOffset());
    const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const strIni = inicio.toLocaleDateString('es-AR', opciones);
    const strFin = fin.toLocaleDateString('es-AR', { ...opciones, year: 'numeric' });
    return `${strIni} - ${strFin}`;
  });

  readonly diasSemana = computed<DiaAgendaSemanal[]>(() => {
    const { inicio } = this.obtenerLimitesSemana(this.semanaOffset());
    const hoyIso = new Date().toISOString().split('T')[0];
    const turnos = this.turnosMedico();

    const nombresDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const resultado: DiaAgendaSemanal[] = [];

    for (let i = 0; i < 7; i++) {
      const fechaDia = new Date(inicio);
      fechaDia.setDate(inicio.getDate() + i);
      const iso = fechaDia.toISOString().split('T')[0];

      const turnosDelDia = turnos
        .filter(t => t.fecha === iso)
        .sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));

      resultado.push({
        fechaIso: iso,
        nombreDia: nombresDias[i],
        diaMes: fechaDia.getDate(),
        esHoy: iso === hoyIso,
        turnos: turnosDelDia
      });
    }

    return resultado;
  });

  readonly totalTurnosSemana = computed(() => {
    return this.diasSemana().reduce((acc, d) => acc + d.turnos.length, 0);
  });

  ngOnInit(): void {
    this.cargarTurnos();
  }

  cargarTurnos(): void {
    const currentMedId = this.authService.currentUser()?.idMedico;
    this.cargando.set(true);

    this.turnoService.listarTodos().subscribe({
      next: (data) => {
        const filtrados = currentMedId ? data.filter(t => t.medico?.idMedico === currentMedId) : data;
        this.turnosMedico.set(filtrados);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar agenda del médico:', err);
        this.cargando.set(false);
      }
    });
  }

  cambiarSemana(delta: number): void {
    this.semanaOffset.update(v => v + delta);
  }

  irSemanaActual(): void {
    this.semanaOffset.set(0);
  }

  private obtenerLimitesSemana(offsetSemanas: number): { inicio: Date; fin: Date } {
    const ahora = new Date();
    ahora.setDate(ahora.getDate() + offsetSemanas * 7);

    const diaActual = ahora.getDay();
    const distanciaLunes = diaActual === 0 ? -6 : 1 - diaActual;

    const lunes = new Date(ahora);
    lunes.setDate(ahora.getDate() + distanciaLunes);
    lunes.setHours(0, 0, 0, 0);

    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    domingo.setHours(23, 59, 59, 999);

    return { inicio: lunes, fin: domingo };
  }
}

