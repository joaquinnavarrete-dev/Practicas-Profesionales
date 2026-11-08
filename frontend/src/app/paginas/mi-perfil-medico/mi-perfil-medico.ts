import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicoService, AuthService, NotificationService } from '../../services';
import { Medico, MedicoRequest } from '../../models';
import { AdminTopbarComponent } from '../../componentes/admin-topbar/admin-topbar';

@Component({
  selector: 'app-mi-perfil-medico',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminTopbarComponent],
  templateUrl: './mi-perfil-medico.html',
  styleUrl: './mi-perfil-medico.css'
})
export class MiPerfilMedicoComponent implements OnInit {
  private readonly medicoService = inject(MedicoService);
  private readonly notify = inject(NotificationService);
  readonly authService = inject(AuthService);

  readonly cargando = signal<boolean>(false);
  readonly guardando = signal<boolean>(false);
  readonly medico = signal<Medico | null>(null);

  telefonoEdit = '';

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    const idMed = this.authService.currentUser()?.idMedico;
    if (!idMed) {
      this.notify.error('No se pudo identificar la ficha del médico en sesión.');
      return;
    }

    this.cargando.set(true);
    this.medicoService.buscarPorId(idMed).subscribe({
      next: (data) => {
        this.medico.set(data);
        this.telefonoEdit = data.telefono || '';
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar perfil médico:', err);
        this.notify.error('Error al recuperar información del perfil profesional.');
        this.cargando.set(false);
      }
    });
  }

  guardarTelefono(): void {
    const m = this.medico();
    if (!m) return;

    if (!this.telefonoEdit.trim()) {
      this.notify.warning('El número de teléfono no puede quedar vacío.');
      return;
    }

    const payload: MedicoRequest = {
      nombre: m.nombre,
      apellido: m.apellido,
      matricula: m.matricula,
      telefono: this.telefonoEdit.trim(),
      idEspecialidad: m.especialidad.idEspecialidad,
      idUsuario: m.idUsuario
    };

    this.guardando.set(true);
    this.medicoService.actualizar(m.idMedico, payload).subscribe({
      next: (actualizado) => {
        this.medico.set(actualizado);
        this.guardando.set(false);
        this.notify.success('Teléfono de contacto actualizado correctamente.');
      },
      error: (err) => {
        console.error('Error al actualizar teléfono:', err);
        this.guardando.set(false);
        this.notify.error('No se pudo actualizar el teléfono. Intente nuevamente.');
      }
    });
  }
}

