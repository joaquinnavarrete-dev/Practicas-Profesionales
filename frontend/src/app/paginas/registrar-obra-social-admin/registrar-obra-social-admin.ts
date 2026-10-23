import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

/**
 * Componente Standalone para el Registro y Alta de Obras Sociales / Prepagas.
 * Accesible únicamente desde el panel administrativo de la clínica.
 */
@Component({
  selector: 'app-registrar-obra-social-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registrar-obra-social-admin.html',
  styleUrl: './registrar-obra-social-admin.css'
})
export class RegistrarObraSocialAdminComponent {

  /**
   * Objeto DTO que almacena los campos del formulario.
   * Estructurado para ser consumido por el backend mediante un POST (ej: /api/obras-sociales).
   */
  obraSocialForm = {
    nombre: '',          // Razón social completa (Ej. Obra Social de Empleados de Comercio)
    siglas: '',          // Siglas o nombre comercial corto (Ej. OSECAC)
    cuit: '',            // CUIT de la institución para facturación
    telefono: '',        // Teléfono de auditoría médica / mesa de entradas
    email: '',           // Correo electrónico institucional para validación
    planesDisponibles: '', // Planes que cubre (Ej. Plan 100, Plan 200, Plan V)
    estado: 'Activa'     // Estado inicial en el sistema ('Activa' o 'Suspendida')
  };

  /**
   * Constructor del componente.
   * @param router Servicio de navegación para redirigir al listado tras guardar.
   */
  constructor(private router: Router) {}

  /**
   * Método que procesa el alta de la obra social.
   * Simula el envío de datos al servidor y retorna al padrón de coberturas.
   */
  guardarObraSocial(): void {
    // Validación rápida de campos obligatorios
    if (!this.obraSocialForm.nombre || !this.obraSocialForm.siglas || !this.obraSocialForm.cuit) {
      alert('Por favor, complete los campos obligatorios (Nombre, Siglas y CUIT).');
      return;
    }

    // Registro en consola simulando el payload hacia Spring Boot (POST /api/obras-sociales)
    console.log('Enviando nueva Obra Social a Spring Boot:', this.obraSocialForm);

    // Mensaje de éxito institucional
    alert('¡Obra social y planes registrados con éxito en el sistema!');

    // Redirección automática al listado administrativo de obras sociales
    this.router.navigate(['/admin/obras-sociales']);
  }

}