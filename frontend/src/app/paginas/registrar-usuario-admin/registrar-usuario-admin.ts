import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-registrar-usuario-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registrar-usuario-admin.html',
  styleUrl: './registrar-usuario-admin.css'
})
export class RegistrarUsuarioAdminComponent {

  // Objeto DTO que mapea el payload para enviar a Spring Boot (POST /api/usuarios)
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

  constructor(private router: Router) {}

  // Lógica de guardado y alta de usuario
  guardarUsuario(): void {
    if (this.usuarioForm.password !== this.usuarioForm.confirmPassword) {
      alert('Las contraseñas ingresadas no coinciden.');
      return;
    }

    console.log('Enviando nuevo usuario al backend de Spring Boot:', this.usuarioForm);
    alert('¡Usuario del sistema registrado correctamente!');
    
    // Redirige de regreso al padrón general de usuarios
    this.router.navigate(['/admin/usuarios']);
  }

}