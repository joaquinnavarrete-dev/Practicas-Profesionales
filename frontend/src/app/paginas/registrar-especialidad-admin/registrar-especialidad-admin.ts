import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EspecialidadService, NotificationService } from '../../services';

@Component({
  selector: 'app-registrar-especialidad-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registrar-especialidad-admin.html',
  styleUrl: './registrar-especialidad-admin.css'
})
export class RegistrarEspecialidadAdminComponent {
  private readonly router = inject(Router);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly notify = inject(NotificationService);

  guardando: boolean = false;

  especialidadForm = {
    nombre: '',
    codigo: '',
    descripcion: '',
    duracionTurno: '30',
    estado: 'Activa'
  };

  guardarEspecialidad(): void {
    if (!this.especialidadForm.nombre.trim()) {
      this.notify.warning('Por favor, ingrese el nombre de la especialidad.');
      return;
    }

    this.guardando = true;
    this.especialidadService.crear({
      nombre: this.especialidadForm.nombre.trim()
    }).subscribe({
      next: (nuevaEsp) => {
        this.guardando = false;
        this.notify.success(`¡Especialidad médica "${nuevaEsp.nombre}" registrada con éxito!`);
        this.router.navigate(['/admin/especialidades']);
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error al registrar especialidad en Spring Boot:', err);
        this.notify.error(err?.error?.message || 'Error al conectar con el servidor para registrar la especialidad.');
      }
    });
  }

}
