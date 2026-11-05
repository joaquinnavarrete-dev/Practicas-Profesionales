import { Component, Input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-topbar.html',
  styleUrl: './admin-topbar.css'
})
export class AdminTopbarComponent {
  readonly authService = inject(AuthService);

  @Input() titulo: string = 'Panel de Gestión';
  @Input() icono: string = '⚙️';

  readonly nombreUsuario = computed(() => {
    return this.authService.currentUser()?.nombreUsuario || 'Usuario';
  });

  readonly rolFormateado = computed(() => {
    const rol = this.authService.userRole() || '';
    if (rol.includes('ADMINISTRADOR')) return 'Administrador';
    if (rol.includes('MEDICO')) return 'Médico / Especialista';
    if (rol.includes('RECEPCIONISTA')) return 'Recepción / Admisión';
    return 'Personal Clínico';
  });

  readonly inicialUsuario = computed(() => {
    return this.nombreUsuario().charAt(0).toUpperCase();
  });

  cerrarSesion(): void {
    this.authService.logout();
  }
}

