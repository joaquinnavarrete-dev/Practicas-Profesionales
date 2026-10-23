import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/**
 * Componente Standalone para la Edición de Especialidades Médicas.
 * Captura el ID desde la URL, precarga los datos actuales y permite modificarlos
 * para su posterior envío al backend mediante un PUT (ej: /api/especialidades/{id}).
 */
@Component({
  selector: 'app-editar-especialidad-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './editar-especialidad-admin.html',
  styleUrl: './editar-especialidad-admin.css'
})
export class EditarEspecialidadAdminComponent implements OnInit {

  // Almacena el ID de la especialidad que viene por parámetro en la URL
  especialidadId: string | null = null;

  // Objeto DTO precargable con los campos del formulario de edición
  especialidadForm = {
    nombre: '',
    codigo: '',
    descripcion: '',
    duracionTurno: '30',
    estado: 'Activa'
  };

  // Base de datos mock temporal (simulando el padrón de especialidades de la clínica)
  private especialidadesMockBD = [
    {
      id: 1,
      nombre: 'Cardiología Infantil',
      codigo: 'ESP-CARD-01',
      descripcion: 'Prevención, diagnóstico y tratamiento de las enfermedades del corazón en infantes',
      duracionTurno: '30',
      estado: 'Activa'
    },
    {
      id: 2,
      nombre: 'Cardiología Clínica',
      codigo: 'ESP-CARD-02',
      descripcion: 'Cardiología clínica general y ergometría',
      duracionTurno: '30',
      estado: 'Activa'
    },
    {
      id: 3,
      nombre: 'Pediatría Integral',
      codigo: 'ESP-PED-03',
      descripcion: 'Atención integral de la salud infantil y adolescentes',
      duracionTurno: '20',
      estado: 'Activa'
    },
    {
      id: 4,
      nombre: 'Traumatología y Ortopedia',
      codigo: 'ESP-TRAUM-04',
      descripcion: 'Lesiones del sistema músculo esquelético y articulaciones',
      duracionTurno: '30',
      estado: 'Activa'
    },
    {
      id: 5,
      nombre: 'Neurología',
      codigo: 'ESP-NEUR-05',
      descripcion: 'Trastornos del sistema nervioso central y periférico',
      duracionTurno: '45',
      estado: 'Activa'
    },
    {
      id: 6,
      nombre: 'Ginecología y Obstetricia',
      codigo: 'ESP-GIN-06',
      descripcion: 'Salud integral femenina y control obstétrico',
      duracionTurno: '30',
      estado: 'Activa'
    }
  ];

  /**
   * Constructor del componente.
   * @param route Servicio para capturar parámetros de la ruta activa (ActivatedRoute).
   * @param router Servicio de navegación para redirigir tras guardar los cambios.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /**
   * Hook que se ejecuta al inicializar el componente.
   * Captura el ID de la URL y busca la especialidad correspondiente para precargarla.
   */
  ngOnInit(): void {
    // Captura el parámetro ':id' definido en app.routes.ts
    this.especialidadId = this.route.snapshot.paramMap.get('id');

    if (this.especialidadId) {
      const idNum = Number(this.especialidadId);
      console.log('Buscando datos para modificar la especialidad ID:', idNum);

      // Buscamos en el mock la especialidad que coincida con el ID
      const espEncontrada = this.especialidadesMockBD.find(e => e.id === idNum);

      if (espEncontrada) {
        // Precargamos el formulario con los datos reales encontrados
        this.especialidadForm = { ...espEncontrada };
      } else {
        console.warn('No se encontró ninguna especialidad con ese ID en la base de datos mock.');
      }
    }
  }

  /**
   * Método que envía las modificaciones de la especialidad al backend.
   * Simula la petición PUT y redirige al listado administrativo.
   */
  actualizarEspecialidad(): void {
    console.log(`Enviando modificaciones de la especialidad ID ${this.especialidadId} a Spring Boot (PUT /api/especialidades/${this.especialidadId}):`, this.especialidadForm);
    
    alert('¡Modificaciones de la especialidad guardadas con éxito!');

    // Redirige de regreso al padrón general de especialidades
    this.router.navigate(['/admin/especialidades']);
  }

}