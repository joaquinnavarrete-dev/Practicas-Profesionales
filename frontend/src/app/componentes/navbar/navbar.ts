import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  readonly authService = inject(AuthService);

  get esPersonalClinico(): boolean {
    return this.authService.isAdmin() || this.authService.isMedico() || this.authService.isRecepcionista();
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}
