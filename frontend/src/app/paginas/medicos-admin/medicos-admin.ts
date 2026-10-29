import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MedicoService } from '../../services/medico.service';
import { EspecialidadService } from '../../services/especialidad.service';
import { Medico, Especialidad } from '../../models';

@Component({
  selector: 'app-medicos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medicos-admin.html',
  styleUrl: './medicos-admin.css'
})
export class MedicosAdminComponent implements OnInit {
  private readonly medicoService = inject(MedicoService);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly router = inject(Router);

  busquedaGlobal: string = '';
  especialidadFiltro: string = 'Todas';

  medicos: Medico[] = [];
  medicosFiltrados: Medico[] = [];
  especialidades: Especialidad[] = [];
  cargando: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    this.cargarMedicos();
    this.cargarEspecialidades();
  }

  cargarMedicos(): void {
    this.cargando = true;
    this.errorMessage = '';
    this.medicoService.listar().subscribe({
      next: (data) => {
        this.medicos = data;
        this.cargando = false;
        this.aplicarFiltros();
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error al cargar médicos:', err);
        this.errorMessage = 'No se pudo conectar con el servidor para cargar el padrón médico.';
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

    this.medicosFiltrados = this.medicos.filter(m => {
      const matchEsp = this.especialidadFiltro === 'Todas' ||
        m.especialidad.nombre === this.especialidadFiltro;

      const nombreCompleto = `${m.nombre} ${m.apellido}`.toLowerCase();
      const matchQuery = !q ||
        nombreCompleto.includes(q) ||
        m.matricula.toLowerCase().includes(q) ||
        m.especialidad.nombre.toLowerCase().includes(q);

      return matchEsp && matchQuery;
    });
  }

  resetearFiltros(): void {
    this.busquedaGlobal = '';
    this.especialidadFiltro = 'Todas';
    this.aplicarFiltros();
  }

  abrirModalCrear(): void {
    this.router.navigate(['/admin/medicos/nuevo']);
  }

  verAgenda(m: Medico): void {
    this.router.navigate(['/admin/turnos'], { queryParams: { idMedico: m.idMedico } });
  }

  editarMedico(m: Medico): void {
    this.router.navigate(['/admin/medicos/editar', m.idMedico]);
  }

  eliminarMedico(m: Medico): void {
    if (confirm(`¿Está seguro de eliminar al profesional Dr(a). ${m.nombre} ${m.apellido}?`)) {
      this.medicoService.eliminar(m.idMedico).subscribe({
        next: () => {
          this.cargarMedicos();
        },
        error: (err) => {
          console.error('Error al eliminar médico:', err);
          alert(err.error?.message || 'No se puede eliminar el médico si tiene turnos o agendas activas.');
        }
      });
    }
  }
}
