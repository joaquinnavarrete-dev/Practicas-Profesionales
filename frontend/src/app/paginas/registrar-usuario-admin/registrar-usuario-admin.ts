import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../services';

@Component({
  selector: 'app-registrar-usuario-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registrar-usuario-admin.html',
  styleUrl: './registrar-usuario-admin.css'
})
export class RegistrarUsuarioAdminComponent {

  guardando: boolean = false;

  usuarioForm = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    rol: 'Recepción'
  };

  constructor(
    private router: Router,
    private usuarioService: UsuarioService
  ) { }

  guardarUsuario(): void {
    if (!this.usuarioForm.username.trim() || !this.usuarioForm.password) {
      alert('Por favor, complete el nombre de usuario y la contraseña.');
      return;
    }

    if (this.usuarioForm.password !== this.usuarioForm.confirmPassword) {
      alert('Las contraseñas ingresadas no coinciden.');
      return;
    }

    this.guardando = true;

    let idRol = 3;
    if (this.usuarioForm.rol === 'Administrador') {
      idRol = 1;
    } else if (this.usuarioForm.rol === 'Médico') {
      idRol = 2;
    }

    this.usuarioService.crear({
      nombreUsuario: this.usuarioForm.username.trim(),
      password: this.usuarioForm.password,
      idRol: idRol,
      estado: true
    }).subscribe({
      next: (nuevoUsuario) => {
        this.guardando = false;
        alert(`¡Usuario @${nuevoUsuario.nombreUsuario} registrado exitosamente en el sistema!`);
        this.router.navigate(['/admin/usuarios']);
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error al registrar usuario en Spring Boot:', err);
        alert(err?.error?.message || 'Error al comunicarse con el servidor para registrar el usuario.');
      }
    });
  }

}
