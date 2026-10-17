import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',       // Si se llama login.component.html, ponelo tal cual
  styleUrl: './login.css'          // Si se llama login.component.css, ponelo tal cual
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  mostrarPassword: boolean = false;

  constructor(private router: Router) {}

  toggleMostrarPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  iniciarSesion() {
    console.log('Intento de login:', { email: this.email, password: this.password });
    
    // Simulación: Redirigir al dashboard administrativo
    // Cuando integres con Spring Boot, acá llamás a tu servicio de autenticación
    this.router.navigate(['/admin/dashboard']);
  }
}