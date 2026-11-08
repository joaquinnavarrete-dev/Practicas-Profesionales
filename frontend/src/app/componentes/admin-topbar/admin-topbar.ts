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
    const user = this.authService.currentUser();
    if (!user) return 'Usuario';
    const raw = user.nombreUsuario || 'Usuario';
    if (!this.authService.isMedico()) {
      return raw.replace(/^(dr\.|dr\s+|dra\.|dra\s+)/i, '');
    }
    return raw;
  });

  readonly rolFormateado = computed(() => {
    if (this.authService.isAdmin()) return 'Administrador';
    if (this.authService.isMedico()) return 'Médico / Especialista';
    if (this.authService.isRecepcionista()) return 'Recepción / Admisión';
    return 'Personal Clínico';
  });

  readonly inicialUsuario = computed(() => {
    return this.nombreUsuario().charAt(0).toUpperCase();
  });

  cerrarSesion(): void {
    this.authService.logout();
  }
}

