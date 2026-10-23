import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

/**
 * Componente Standalone para el Registro y Alta de Especialidades Médicas.
 * Accesible únicamente desde el panel administrativo de la clínica para gestionar el carteleras y turnos.
 */
@Component({
  selector: 'app-registrar-especialidad-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registrar-especialidad-admin.html',
  styleUrl: './registrar-especialidad-admin.css'
})
export class RegistrarEspecialidadAdminComponent {

  /**
   * Objeto DTO que almacena los campos del formulario de la especialidad.
   * Estructurado para ser consumido por el backend mediante un POST (ej: /api/especialidades).
   */
  especialidadForm = {
    nombre: '',           // Nombre principal de la especialidad (Ej. Cardiología, Pediatría)
    codigo: '',           // Código interno o abreviatura hospitalaria (Ej. CARD-01)
    descripcion: '',      // Descripción de las patologías o áreas que abarca
    duracionTurno: '30',  // Duración estimada por consulta en minutos
    estado: 'Activa'      // Estado inicial en la cartilla médica ('Activa' o 'Inactiva')
  };

  /**
   * Constructor del componente.
   * @param router Servicio de navegación para redirigir al padrón tras guardar exitosamente.
   */
  constructor(private router: Router) {}

  /**
   * Método que procesa el alta de la especialidad médica.
   * Valida los campos esenciales, simula el payload hacia Spring Boot y redirige.
   */
  guardarEspecialidad(): void {
    // Validación rápida de campos obligatorios
    if (!this.especialidadForm.nombre || !this.especialidadForm.codigo) {
      alert('Por favor, complete los campos obligatorios (Nombre y Código interno).');
      return;
    }

    // Registro en consola simulando el envío hacia Spring Boot (POST /api/especialidades)
    console.log('Enviando nueva Especialidad Médica a Spring Boot:', this.especialidadForm);

    // Mensaje de éxito institucional
    alert('¡Especialidad médica registrada con éxito en el sistema!');

    // Redirección automática al listado administrativo de especialidades
    this.router.navigate(['/admin/especialidades']);
  }

}