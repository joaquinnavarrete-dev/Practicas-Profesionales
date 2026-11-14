import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TurnoService, AuthService } from '../../services';
import { Turno, MetricaObraSocial, MesRendimiento } from '../../models';
import { AdminTopbarComponent } from '../../componentes/admin-topbar/admin-topbar';

@Component({
  selector: 'app-mis-metricas-medico',
  standalone: true,
  imports: [CommonModule, AdminTopbarComponent],
  templateUrl: './mis-metricas-medico.html',
  styleUrl: './mis-metricas-medico.css'
})
export class MisMetricasMedicoComponent implements OnInit {
  private readonly turnoService = inject(TurnoService);
  readonly authService = inject(AuthService);

  readonly cargando = signal<boolean>(false);
  readonly turnosMedico = signal<Turno[]>([]);

  readonly totalConsultas = computed(() => this.turnosMedico().length);

  readonly totalAtendidos = computed(() => {
    return this.turnosMedico().filter(t => t.estado === 'Atendido').length;
  });

  readonly totalAusentes = computed(() => {
    return this.turnosMedico().filter(t => t.estado === 'Ausente').length;
  });

  readonly tasaAsistencia = computed(() => {
    const atendidos = this.totalAtendidos();
    const ausentes = this.totalAusentes();
    const concluidos = atendidos + ausentes;
    if (!concluidos) return 100;
    return Math.round((atendidos / concluidos) * 100);
  });

  readonly distribucionObrasSociales = computed<MetricaObraSocial[]>(() => {
    const turnos = this.turnosMedico();
    if (!turnos.length) return [];

    const conteo: { [os: string]: number } = {};
    turnos.forEach(t => {
      const nombre = t.paciente?.obraSocial?.nombre || 'Particular / Sin Obra Social';
      conteo[nombre] = (conteo[nombre] || 0) + 1;
    });

    const colores = ['#0284c7', '#0f766e', '#7e22ce', '#eab308', '#dc2626', '#3b82f6'];
    let idx = 0;

    return Object.keys(conteo).map(os => {
      const cant = conteo[os];
      const pct = Math.round((cant / turnos.length) * 100);
      const color = colores[idx % colores.length];
      idx++;
      return {
        nombre: os,
        cantidad: cant,
        porcentaje: pct,
        color
      };
    });
  });

  readonly ultimosMeses = computed<MesRendimiento[]>(() => {
    const turnos = this.turnosMedico();
    if (!turnos.length) return [];

    const mapa: { [mes: string]: { atendidos: number; ausentes: number } } = {};
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    turnos.forEach(t => {
      if (!t.fecha) return;
      const partes = t.fecha.split('-');
      if (partes.length < 2) return;
      const mesNum = parseInt(partes[1], 10) - 1;
      const anio = partes[0];
      const clave = `${nombresMeses[mesNum]} ${anio}`;

      if (!mapa[clave]) {
        mapa[clave] = { atendidos: 0, ausentes: 0 };
      }
      if (t.estado === 'Atendido') {
        mapa[clave].atendidos++;
      } else if (t.estado === 'Ausente') {
        mapa[clave].ausentes++;
      }
    });

    return Object.keys(mapa).map(k => {
      const datos = mapa[k];
      const total = datos.atendidos + datos.ausentes;
      const efectividad = total > 0 ? Math.round((datos.atendidos / total) * 100) : 100;
      return {
        mesNombre: k,
        totalAtendidos: datos.atendidos,
        totalAusentes: datos.ausentes,
        efectividad
      };
    });
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    const idMed = this.authService.currentUser()?.idMedico;
    this.cargando.set(true);

    this.turnoService.listarTodos().subscribe({
      next: (turnos) => {
        const filtrados = idMed ? turnos.filter(t => t.medico?.idMedico === idMed) : turnos;
        this.turnosMedico.set(filtrados);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar métricas del médico:', err);
        this.cargando.set(false);
      }
    });
  }
}

