import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  nombreUsuario: string = '';
  password: string = '';
  readonly mostrarPassword = signal<boolean>(false);
  readonly cargando = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  toggleMostrarPassword(): void {
    this.mostrarPassword.update(v => !v);
  }

  iniciarSesion(): void {
    if (!this.nombreUsuario.trim() || !this.password) {
      this.errorMessage.set('Por favor, ingrese su usuario y contraseña.');
      return;
    }

    this.cargando.set(true);
    this.errorMessage.set('');

    this.authService.login({
      nombreUsuario: this.nombreUsuario.trim(),
      password: this.password
    }).subscribe({
      next: (res) => {
        this.cargando.set(false);

        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
          return;
        }

        if (res.rol === 'ADMINISTRADOR' || res.rol === 'MEDICO' || res.rol === 'RECEPCIONISTA') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/mi-portal']);
        }
      },
      error: (err) => {
        this.cargando.set(false);
        console.error('Error al iniciar sesión:', err);

        if (err.status === 401 || err.status === 400) {
          this.errorMessage.set('Usuario o contraseña incorrectos. Verifique sus credenciales.');
        } else if (err.status === 0) {
          this.errorMessage.set('No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.');
        } else {
          this.errorMessage.set(err.error?.message || 'Ocurrió un error al procesar el ingreso. Intente nuevamente.');
        }
      }
    });
  }
}
