import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurnoService, MedicoService, EspecialidadService, ObraSocialService, NotificationService, AuthService } from '../../services';
import { Turno, Medico, Especialidad, ObraSocial, ReporteItemEspecialidad, ReporteItemMedico, ReporteItemObraSocial } from '../../models';
import { AdminTopbarComponent } from '../../componentes/admin-topbar/admin-topbar';

@Component({
  selector: 'app-reportes-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminTopbarComponent],
  templateUrl: './reportes-admin.html',
  styleUrl: './reportes-admin.css'
})
export class ReportesAdminComponent implements OnInit {
  private readonly turnoService = inject(TurnoService);
  private readonly medicoService = inject(MedicoService);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly obraSocialService = inject(ObraSocialService);
  private readonly notify = inject(NotificationService);
  readonly authService = inject(AuthService);

  readonly cargando = signal<boolean>(false);
  readonly tabActiva = signal<'especialidades' | 'medicos' | 'obrasSociales'>('especialidades');

  readonly turnos = signal<Turno[]>([]);
  readonly medicos = signal<Medico[]>([]);
  readonly especialidades = signal<Especialidad[]>([]);
  readonly obrasSociales = signal<ObraSocial[]>([]);

  readonly reporteEspecialidades = computed<ReporteItemEspecialidad[]>(() => {
    const turnos = this.turnos();
    const espList = this.especialidades();

    return espList.map(esp => {
      const turnosEsp = turnos.filter(t => t.especialidad?.idEspecialidad === esp.idEspecialidad || t.medico?.especialidad?.idEspecialidad === esp.idEspecialidad);
      const atendidos = turnosEsp.filter(t => t.estado === 'Atendido').length;
      const ausentes = turnosEsp.filter(t => t.estado === 'Ausente' || t.estado === 'Cancelado').length;
      const concluidos = atendidos + ausentes;
      const efectividad = concluidos > 0 ? Math.round((atendidos / concluidos) * 100) : 100;

      return {
        nombre: esp.nombre,
        totalTurnos: turnosEsp.length,
        atendidos,
        ausentes,
        efectividad
      };
    }).sort((a, b) => b.totalTurnos - a.totalTurnos);
  });

  readonly reporteMedicos = computed<ReporteItemMedico[]>(() => {
    const turnos = this.turnos();
    const medicosList = this.medicos();

    return medicosList.map(m => {
      const turnosMed = turnos.filter(t => t.medico?.idMedico === m.idMedico);
      const atendidos = turnosMed.filter(t => t.estado === 'Atendido').length;
      const ausentes = turnosMed.filter(t => t.estado === 'Ausente' || t.estado === 'Cancelado').length;
      const concluidos = atendidos + ausentes;
      const efectividad = concluidos > 0 ? Math.round((atendidos / concluidos) * 100) : 100;

      return {
        nombre: `Dr(a). ${m.nombre} ${m.apellido}`,
        especialidad: m.especialidad?.nombre || 'General',
        totalTurnos: turnosMed.length,
        atendidos,
        ausentes,
        efectividad
      };
    }).sort((a, b) => b.totalTurnos - a.totalTurnos);
  });

  readonly reporteObrasSociales = computed<ReporteItemObraSocial[]>(() => {
    const turnos = this.turnos();
    if (!turnos.length) return [];

    const conteo: { [os: string]: number } = {};
    turnos.forEach(t => {
      const nombre = t.paciente?.obraSocial?.nombre || 'Particular / Sin Obra Social';
      conteo[nombre] = (conteo[nombre] || 0) + 1;
    });

    return Object.keys(conteo).map(os => ({
      nombre: os,
      totalTurnos: conteo[os],
      porcentaje: Math.round((conteo[os] / turnos.length) * 100)
    })).sort((a, b) => b.totalTurnos - a.totalTurnos);
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);

    this.turnoService.listarTodos().subscribe({
      next: (tList) => {
        this.turnos.set(tList);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar turnos para reportes:', err);
        this.cargando.set(false);
      }
    });

    this.medicoService.listar().subscribe({
      next: (mList) => this.medicos.set(mList),
      error: (err) => console.error('Error al cargar médicos:', err)
    });

    this.especialidadService.listar().subscribe({
      next: (eList) => this.especialidades.set(eList),
      error: (err) => console.error('Error al cargar especialidades:', err)
    });

    this.obraSocialService.listar().subscribe({
      next: (oList) => this.obrasSociales.set(oList),
      error: (err) => console.error('Error al cargar obras sociales:', err)
    });
  }

  cambiarTab(tab: 'especialidades' | 'medicos' | 'obrasSociales'): void {
    this.tabActiva.set(tab);
  }

  exportarCSV(): void {
    let csvContent = '\uFEFF';

    if (this.tabActiva() === 'especialidades') {
      csvContent += 'Especialidad;Total Turnos;Consultas Atendidas;Ausentes;Efectividad (%)\n';
      this.reporteEspecialidades().forEach(e => {
        csvContent += `"${e.nombre}";${e.totalTurnos};${e.atendidos};${e.ausentes};${e.efectividad}%\n`;
      });
    } else if (this.tabActiva() === 'medicos') {
      csvContent += 'Profesional;Especialidad;Total Turnos;Atendidos;Ausentes;Efectividad (%)\n';
      this.reporteMedicos().forEach(m => {
        csvContent += `"${m.nombre}";"${m.especialidad}";${m.totalTurnos};${m.atendidos};${m.ausentes};${m.efectividad}%\n`;
      });
    } else {
      csvContent += 'Obra Social / Cobertura;Total Citas;Porcentaje (%)\n';
      this.reporteObrasSociales().forEach(o => {
        csvContent += `"${o.nombre}";${o.totalTurnos};${o.porcentaje}%\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_${this.tabActiva()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.notify.success('Archivo CSV generado y descargado con éxito.');
  }

  imprimir(): void {
    window.print();
  }
}

