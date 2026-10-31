import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  readonly authService = inject(AuthService);
  readonly menuMovilAbierto = signal<boolean>(false);

  readonly esPersonalClinico = computed(() => 
    this.authService.isAdmin() || this.authService.isMedico() || this.authService.isRecepcionista()
  );

  readonly esPaciente = computed(() => 
    this.authService.isLoggedIn() && !this.esPersonalClinico()
  );

  toggleMenuMovil(): void {
    this.menuMovilAbierto.update(v => !v);
  }

  cerrarMenuMovil(): void {
    this.menuMovilAbierto.set(false);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.cerrarMenuMovil();
  }
}
