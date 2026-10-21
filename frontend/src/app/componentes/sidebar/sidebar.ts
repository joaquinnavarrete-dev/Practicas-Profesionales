import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  constructor(private router: Router) {}

  // Maneja la salida del usuario del panel administrativo redirigiéndolo al Login
  // Futuro con Spring Boot: Limpiará el JWT/Token del localStorage
  cerrarSesion(): void {
    console.log('Cerrando sesión de usuario administrador...');
    this.router.navigate(['/login']);
  }

}