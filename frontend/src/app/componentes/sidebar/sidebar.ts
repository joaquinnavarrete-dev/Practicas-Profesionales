import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  readonly authService = inject(AuthService);

  readonly rolFormateado = computed(() => {
    const rol = this.authService.userRole();
    if (!rol) return 'Gestión Médica';
    if (this.authService.isAdmin()) return 'Administrador General';
    if (this.authService.isMedico()) return 'Médico / Especialista';
    if (this.authService.isRecepcionista()) return 'Recepción / Mostrador';
    if (this.authService.isPaciente()) return 'Paciente';
    return rol.replace('ROLE_', '');
  });

  readonly nombreMostrar = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return 'Clínica San Gabriel';
    const raw = user.nombreUsuario || 'Usuario';
    if (!this.authService.isMedico()) {
      return raw.replace(/^(dr\.|dr\s+|dra\.|dra\s+)/i, '');
    }
    return raw;
  });

  readonly rutaInicio = computed(() => {
    if (this.authService.isMedico()) {
      return '/admin/pacientes-por-medico';
    }
    return '/admin';
  });

  cerrarSesion(): void {
    this.authService.logout();
  }
}
