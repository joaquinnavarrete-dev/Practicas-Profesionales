import { Component, inject, computed, signal, HostListener } from '@angular/core';
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

  readonly mostrarBotonArriba = signal(false);

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const yOffset = window.pageYOffset || document.documentElement.scrollTop || 0;
    this.mostrarBotonArriba.set(yOffset > 300);
  }

  volverArriba(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  readonly esPersonalClinico = computed(() =>
    this.authService.isAdmin() || this.authService.isMedico() || this.authService.isRecepcionista()
  );

  readonly esPaciente = computed(() =>
    this.authService.isLoggedIn() && !this.esPersonalClinico()
  );
}
