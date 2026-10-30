import { Component, OnInit, inject, signal, computed } from '@angular/core';
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

  readonly busquedaGlobal = signal<string>('');
  readonly obraSocialFiltro = signal<string>('Todas');

  readonly pacientes = signal<Paciente[]>([]);
  readonly obrasSociales = signal<ObraSocial[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  readonly pacientesFiltrados = computed(() => {
    const q = this.busquedaGlobal().toLowerCase().trim();
    const filtroOS = this.obraSocialFiltro();
    const lista = this.pacientes();

    return lista.filter(p => {
      const matchOS = filtroOS === 'Todas' ||
                      (p.obraSocial && p.obraSocial.nombre === filtroOS);

      const nombreCompleto = `${p.nombre} ${p.apellido}`.toLowerCase();
      const matchQuery = !q ||
                         nombreCompleto.includes(q) ||
                         p.dni.includes(q) ||
                         p.telefono.includes(q) ||
                         (p.obraSocial && p.obraSocial.nombre.toLowerCase().includes(q));

      return matchOS && matchQuery;
    });
  });

  ngOnInit(): void {
    this.cargarPacientes();
    this.cargarObrasSociales();
  }

  cargarPacientes(): void {
    this.cargando.set(true);
    this.errorMessage.set('');

    this.pacienteService.listar().subscribe({
      next: (data) => {
        this.pacientes.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        console.error('Error al cargar pacientes:', err);
        this.errorMessage.set('No se pudo conectar con el servidor para cargar el padrón de pacientes.');
      }
    });
  }

  cargarObrasSociales(): void {
    this.obraSocialService.listar().subscribe({
      next: (data) => {
        this.obrasSociales.set(data);
      },
      error: (err) => {
        console.error('Error al cargar obras sociales:', err);
      }
    });
  }

  aplicarFiltros(): void {
    // Computado reactivamente por Signals
  }

  resetearFiltros(): void {
    this.busquedaGlobal.set('');
    this.obraSocialFiltro.set('Todas');
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
        this.pacientes.update(lista => lista.filter(item => item.idPaciente !== p.idPaciente));
        this.notify.success(`El paciente ${p.nombre} ${p.apellido} fue eliminado correctamente.`);
      },
      error: (err) => {
        console.error('Error al eliminar paciente:', err);
        this.notify.error(err.error?.message || 'No se puede eliminar el paciente si posee turnos registrados.');
      }
    });
  }
}
