import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-registrar-medico-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registrar-medico-admin.html',
  styleUrl: './registrar-medico-admin.css'
})
export class RegistrarMedicoAdminComponent {

  // Objeto DTO que mapea el payload para enviar a Spring Boot (POST /api/medicos)
  medicoForm = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    matricula: '',
    especialidad: 'Cardiología',
    subespecialidad: '',
    consultorio: 'Consultorio 204 (Piso 2)',
    diasAtencion: ''
  };

  constructor(private router: Router) {}

  // Lógica para enviar el alta del médico al backend
  guardarMedico(): void {
    console.log('Enviando nuevo profesional médico al backend de Spring Boot:', this.medicoForm);
    alert('¡Profesional médico registrado con éxito!');
    
    // Redirige de regreso al padrón del cuerpo médico
    this.router.navigate(['/admin/medicos']);
  }

}