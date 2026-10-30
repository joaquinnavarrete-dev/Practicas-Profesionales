import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class InicioComponent {
  readonly authService = inject(AuthService);

  readonly esPersonalClinico = computed(() =>
    this.authService.isAdmin() || this.authService.isMedico() || this.authService.isRecepcionista()
  );

  readonly esPaciente = computed(() =>
    this.authService.isLoggedIn() && !this.esPersonalClinico()
  );
}
