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
    if (rol.includes('ADMINISTRADOR')) return 'Administrador General';
    if (rol.includes('MEDICO')) return 'Médico / Especialista';
    if (rol.includes('RECEPCIONISTA')) return 'Recepción / Mostrador';
    if (rol.includes('PACIENTE')) return 'Paciente';
    return rol.replace('ROLE_', '');
  });

  cerrarSesion(): void {
    this.authService.logout();
  }
}
