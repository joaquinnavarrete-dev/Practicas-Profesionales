import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ObraSocialService, NotificationService } from '../../services';

@Component({
  selector: 'app-registrar-obra-social-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registrar-obra-social-admin.html',
  styleUrl: './registrar-obra-social-admin.css'
})
export class RegistrarObraSocialAdminComponent {
  private readonly router = inject(Router);
  private readonly obraSocialService = inject(ObraSocialService);
  private readonly notify = inject(NotificationService);

  guardando: boolean = false;

  obraSocialForm = {
    nombre: '',
    siglas: '',
    cuit: '',
    telefono: '',
    email: '',
    planesDisponibles: '',
    estado: 'Activa'
  };

  guardarObraSocial(): void {
    if (!this.obraSocialForm.nombre.trim()) {
      this.notify.warning('Por favor, ingrese el nombre de la obra social.');
      return;
    }

    this.guardando = true;
    this.obraSocialService.crear({
      nombre: this.obraSocialForm.nombre.trim()
    }).subscribe({
      next: (nuevaOS) => {
        this.guardando = false;
        this.notify.success(`¡Obra social "${nuevaOS.nombre}" registrada con éxito en el sistema!`);
        this.router.navigate(['/admin/obras-sociales']);
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error al registrar obra social:', err);
        this.notify.error(err?.error?.message || 'Error al comunicarse con el servidor para registrar la obra social.');
      }
    });
  }

}
