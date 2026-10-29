import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TurnoService } from '../../services/turno.service';
import { EspecialidadService } from '../../services/especialidad.service';
import { Turno, Especialidad } from '../../models';

@Component({
  selector: 'app-turnos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './turnos-admin.html',
  styleUrl: './turnos-admin.css'
})
export class TurnosAdminComponent implements OnInit {
  private readonly turnoService = inject(TurnoService);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly route = inject(ActivatedRoute);

  busquedaGlobal: string = '';
  fechaFiltro: string = '';
  especialidadFiltro: string = 'Todas';

  turnos: Turno[] = [];
  turnosFiltrados: Turno[] = [];
  especialidades: Especialidad[] = [];
  cargando: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    const idMedicoParam = this.route.snapshot.queryParams['idMedico'];

    this.cargarEspecialidades();
    this.cargarTurnos(idMedicoParam ? Number(idMedicoParam) : undefined);
  }

  cargarTurnos(idMedicoFiltro?: number): void {
    this.cargando = true;
    this.errorMessage = '';

    this.turnoService.listarTodos().subscribe({
      next: (data) => {
        if (idMedicoFiltro) {
          this.turnos = data.filter(t => t.medico.idMedico === idMedicoFiltro);
        } else {
          this.turnos = data;
        }
        this.cargando = false;
        this.aplicarFiltros();
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error al cargar turnos:', err);
        this.errorMessage = 'No se pudieron cargar los turnos desde el servidor.';
      }
    });
  }

  cargarEspecialidades(): void {
    this.especialidadService.listar().subscribe({
      next: (data) => {
        this.especialidades = data;
      },
      error: (err) => {
        console.error('Error al cargar especialidades:', err);
      }
    });
  }

  aplicarFiltros(): void {
    const q = this.busquedaGlobal.toLowerCase().trim();

    this.turnosFiltrados = this.turnos.filter(t => {
      const matchFecha = !this.fechaFiltro || t.fecha === this.fechaFiltro;
      const matchEsp = this.especialidadFiltro === 'Todas' ||
        t.especialidad.nombre === this.especialidadFiltro;

      const pacienteFull = `${t.paciente.nombre} ${t.paciente.apellido}`.toLowerCase();
      const medicoFull = `${t.medico.nombre} ${t.medico.apellido}`.toLowerCase();
      const matchQuery = !q ||
        pacienteFull.includes(q) ||
        t.paciente.dni.includes(q) ||
        medicoFull.includes(q) ||
        t.especialidad.nombre.toLowerCase().includes(q);

      return matchFecha && matchEsp && matchQuery;
    });
  }

  resetearFiltros(): void {
    this.busquedaGlobal = '';
    this.fechaFiltro = '';
    this.especialidadFiltro = 'Todas';
    this.aplicarFiltros();
  }

  cancelarTurno(t: Turno): void {
    if (confirm(`¿Confirma la cancelación del turno del paciente ${t.paciente.nombre} ${t.paciente.apellido} para el ${t.fecha} a las ${t.hora} hs?`)) {
      this.turnoService.cancelar(t.idTurno).subscribe({
        next: () => {
          this.turnos = this.turnos.filter(item => item.idTurno !== t.idTurno);
          this.aplicarFiltros();
        },
        error: (err) => {
          console.error('Error al cancelar turno:', err);
          alert(err.error?.message || 'No se pudo cancelar el turno.');
        }
      });
    }
  }
}
