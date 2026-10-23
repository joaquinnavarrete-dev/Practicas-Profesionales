import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

/**
 * Componente Standalone para el Registro Público de Pacientes.
 * Permite que los usuarios externos se den de alta por su cuenta en la web de la clínica.
 */
@Component({
  selector: 'app-registrar-paciente-publico',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registrar-paciente-publico.html',
  styleUrl: './registrar-paciente-publico.css'
})
export class RegistrarPacientePublicoComponent {

  /**
   * Objeto DTO (Data Transfer Object) que almacena los datos ingresados en el formulario.
   * Estructura lista para ser enviada mediante una petición HTTP POST al backend de Spring Boot.
   */
  pacienteForm = {
    nombre: '',            // Nombre(s) del paciente
    apellido: '',          // Apellido(s) del paciente
    dni: '',               // Documento de identidad único
    fechaNacimiento: '',   // Fecha de nacimiento para historia clínica
    genero: 'Masculino',   // Género seleccionado por defecto
    telefono: '',          // Teléfono o celular de contacto
    email: '',             // Correo electrónico (será su usuario de acceso)
    password: '',          // Contraseña para su cuenta web
    confirmPassword: '',   // Confirmación de contraseña
    domicilio: '',         // Dirección física actual
    obraSocial: 'Particular', // Obra social o prepaga elegida
    planAfiliado: ''       // Número de credencial o plan
  };

  /**
   * Constructor del componente.
   * @param router Servicio de enrutamiento de Angular para redirigir tras el registro exitoso.
   */
  constructor(private router: Router) {}

  /**
   * Método que se ejecuta al enviar el formulario de registro público.
   * Valida las contraseñas y simula el envío al servidor.
   */
  registrarUsuarioPublico(): void {
    // Validación básica de coincidencia de contraseñas
    if (this.pacienteForm.password !== this.pacienteForm.confirmPassword) {
      alert('Las contraseñas ingresadas no coinciden. Por favor, verifíquelas.');
      return;
    }

    // Registro en consola simulando el payload hacia Spring Boot (POST /api/auth/register-patient)
    console.log('Enviando datos de autorregistro de paciente a Spring Boot:', this.pacienteForm);

    // Mensaje de éxito para el usuario
    alert('¡Registro exitoso! Ya puede iniciar sesión en su portal de pacientes.');

    // Redirige al usuario hacia la pantalla de inicio o login de la web pública
    this.router.navigate(['/login']);
  }

}