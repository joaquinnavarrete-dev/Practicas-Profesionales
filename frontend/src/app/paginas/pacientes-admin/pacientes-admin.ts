import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PacienteService } from '../../services/paciente.service';
import { ObraSocialService } from '../../services/obra-social.service';
import { NotificationService } from '../../services/notification.service';
import { ConfirmModalService } from '../../services/confirm-modal.service';
import { Paciente, ObraSocial } from '../../models';

@Component({
  selector: 'app-pacientes-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pacientes-admin.html',
  styleUrl: './pacientes-admin.css'
})
export class PacientesAdminComponent implements OnInit {
  private readonly pacienteService = inject(PacienteService);
  private readonly obraSocialService = inject(ObraSocialService);
  private readonly notify = inject(NotificationService);
  private readonly confirmModal = inject(ConfirmModalService);
  private readonly router = inject(Router);

  busquedaGlobal: string = '';
  obraSocialFiltro: string = 'Todas';

  pacientes: Paciente[] = [];
  pacientesFiltrados: Paciente[] = [];
  obrasSociales: ObraSocial[] = [];
  cargando: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    this.cargarPacientes();
    this.cargarObrasSociales();
  }

  cargarPacientes(): void {
    this.cargando = true;
    this.errorMessage = '';

    this.pacienteService.listar().subscribe({
      next: (data) => {
        this.pacientes = data;
        this.cargando = false;
        this.aplicarFiltros();
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error al cargar pacientes:', err);
        this.errorMessage = 'No se pudo conectar con el servidor para cargar el padrón de pacientes.';
      }
    });
  }

  cargarObrasSociales(): void {
    this.obraSocialService.listar().subscribe({
      next: (data) => {
        this.obrasSociales = data;
      },
      error: (err) => {
        console.error('Error al cargar obras sociales:', err);
      }
    });
  }

  aplicarFiltros(): void {
    const q = this.busquedaGlobal.toLowerCase().trim();

    this.pacientesFiltrados = this.pacientes.filter(p => {
      const matchOS = this.obraSocialFiltro === 'Todas' || 
                      (p.obraSocial && p.obraSocial.nombre === this.obraSocialFiltro);

      const nombreCompleto = `${p.nombre} ${p.apellido}`.toLowerCase();
      const matchQuery = !q ||
                         nombreCompleto.includes(q) ||
                         p.dni.includes(q) ||
                         p.telefono.includes(q) ||
                         (p.obraSocial && p.obraSocial.nombre.toLowerCase().includes(q));

      return matchOS && matchQuery;
    });
  }

  resetearFiltros(): void {
    this.busquedaGlobal = '';
    this.obraSocialFiltro = 'Todas';
    this.aplicarFiltros();
  }

  async eliminarPaciente(p: Paciente): Promise<void> {
    const confirmado = await this.confirmModal.confirm({
      titulo: '¿Eliminar Paciente?',
      mensaje: `¿Confirma que desea eliminar la ficha del paciente ${p.nombre} ${p.apellido} (DNI ${p.dni})?`,
      textoConfirmar: 'Eliminar Paciente',
      tipo: 'danger'
    });

    if (!confirmado) return;

    this.pacienteService.eliminar(p.idPaciente).subscribe({
      next: () => {
        this.pacientes = this.pacientes.filter(item => item.idPaciente !== p.idPaciente);
        this.aplicarFiltros();
        this.notify.success(`El paciente ${p.nombre} ${p.apellido} fue eliminado correctamente.`);
      },
      error: (err) => {
        console.error('Error al eliminar paciente:', err);
        this.notify.error(err.error?.message || 'No se puede eliminar el paciente si posee turnos registrados.');
      }
    });
  }
}
