import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../componentes/sidebar/sidebar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout {
  readonly authService = inject(AuthService);
  readonly sidebarAbierto = signal<boolean>(false);

  toggleSidebar(): void {
    this.sidebarAbierto.update(v => !v);
  }

  cerrarSidebar(): void {
    this.sidebarAbierto.set(false);
  }

  onSidebarContentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('a') || target.closest('button')) {
      this.cerrarSidebar();
    }
  }
}
