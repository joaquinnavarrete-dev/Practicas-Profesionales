import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Ajustá la ruta según dónde guardes el service

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email: string = ''; // O nombre de usuario según uses en el input
  password: string = '';
  mostrarPassword: boolean = false;
  errorMensaje: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  toggleMostrarPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  iniciarSesion() {
    console.log('¡HIZO CLIC EN EL BOTÓN!'); // <-- Poné esto bien arriba
    
    const credenciales = {
      nombreUsuario: this.email,
      contrasena: this.password
    };

    this.authService.login(credenciales).subscribe({
      next: (respuesta) => {
        console.log('¡Login exitoso!', respuesta);
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        console.error('Error en el login:', err);
        this.errorMensaje = 'Usuario o contraseña incorrectos';
      }
    });
  }
}