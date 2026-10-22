import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-registrar-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registrar-paciente.html',
  styleUrl: './registrar-paciente.css'
})
export class RegistrarPacienteComponent {

  // Objeto DTO que recibirá el payload para guardar en Spring Boot (POST /api/pacientes)
  pacienteForm = {
    nombre: '',
    apellido: '',
    dni: '',
    fechaNacimiento: '',
    genero: 'Masculino',
    telefono: '',
    email: '',
    domicilio: '',
    obraSocial: 'Particular',
    planAfiliado: ''
  };

  constructor(private router: Router) {}

  // Acción al enviar el formulario
  guardarPaciente(): void {
    console.log('Enviando datos del nuevo paciente a Spring Boot:', this.pacienteForm);
    // Simulamos el éxito y redirigimos al listado de pacientes o al panel admin
    alert('¡Paciente registrado con éxito!');
    this.router.navigate(['/admin/pacientes']);
  }

}