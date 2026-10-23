import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router,ActivatedRoute, RouterLink } from '@angular/router';

// Modelo DTO para Médico (Mapeable a MedicoEntity en Spring Boot)
export interface MedicoAdmin {
  id: number;
  nombre: string;
  apellido: string;
  matricula: string;
  especialidad: string;
  subespecialidad: string;
  consultorio: string;
  diasAtencion: string;
  email: string;
  telefono: string;
  estado: 'Activo' | 'Licencia' | 'Inactivo';
  avatarUrl: string;
}

@Component({
  selector: 'app-medicos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './medicos-admin.html',
  styleUrl: './medicos-admin.css'
})
export class MedicosAdminComponent {

  // Variables de filtrado en pantalla
  busquedaGlobal: string = '';
  especialidadFiltro: string = 'Todas';
  estadoFiltro: string = 'Todos';

  // Padrón mock del cuerpo médico de la clínica
  // Futuro endpoint: GET /api/medicos
  medicos: MedicoAdmin[] = [
    {
      id: 101,
      nombre: 'Mariana',
      apellido: 'Gómez',
      matricula: 'M.N. 142.589',
      especialidad: 'Cardiología',
      subespecialidad: 'Cardiología Clínica y Ergometría',
      consultorio: 'Consultorio 204 (Piso 2)',
      diasAtencion: 'Lun, Mié y Vie (08:00 a 13:00 hs)',
      email: 'mariana.gomez@sangabriel.com',
      telefono: '+54 9 11 4402-9911',
      estado: 'Activo',
      avatarUrl: '👩‍⚕️'
    },
    {
      id: 102,
      nombre: 'Javier',
      apellido: 'Martínez',
      matricula: 'M.N. 118.942',
      especialidad: 'Cardiología',
      subespecialidad: 'Ecocardiografía y Doppler',
      consultorio: 'Consultorio 210 (Piso 2)',
      diasAtencion: 'Mar y Jue (14:00 a 19:00 hs)',
      email: 'javier.martinez@sangabriel.com',
      telefono: '+54 9 11 5501-2244',
      estado: 'Activo',
      avatarUrl: '👨‍⚕️'
    },
    {
      id: 103,
      nombre: 'Roberto',
      apellido: 'Rossi',
      matricula: 'M.N. 95.310',
      especialidad: 'Neurología',
      subespecialidad: 'Electrofisiología y Cefaleas',
      consultorio: 'Consultorio 215 (Piso 2)',
      diasAtencion: 'Lun y Vie (10:00 a 15:00 hs)',
      email: 'roberto.rossi@sangabriel.com',
      telefono: '+54 9 11 6612-8833',
      estado: 'Activo',
      avatarUrl: '👨‍⚕️'
    },
    {
      id: 104,
      nombre: 'Sofía',
      apellido: 'Benítez',
      matricula: 'M.N. 156.402',
      especialidad: 'Pediatría',
      subespecialidad: 'Pediatría General y Neonatología',
      consultorio: 'Consultorio 102 (Piso 1)',
      diasAtencion: 'Mar, Mié y Jue (09:00 a 14:00 hs)',
      email: 'sofia.benitez@sangabriel.com',
      telefono: '+54 9 11 3320-1199',
      estado: 'Licencia',
      avatarUrl: '👩‍⚕️'
    },
    {
      id: 105,
      nombre: 'Gonzalo',
      apellido: 'Alvarez',
      matricula: 'M.N. 104.821',
      especialidad: 'Traumatología',
      subespecialidad: 'Artroscopia y Cirugía de Rodilla',
      consultorio: 'Consultorio 301 (Piso 3)',
      diasAtencion: 'Mié y Jue (15:00 a 20:00 hs)',
      email: 'gonzalo.alvarez@sangabriel.com',
      telefono: '+54 9 11 7741-0022',
      estado: 'Inactivo',
      avatarUrl: '👨‍⚕️'
    }
  ];

  medicosFiltrados: MedicoAdmin[] = [...this.medicos];

  // Inyección del servicio Router para manejo de navegación programática
  constructor(private router: Router) {
    this.aplicarFiltros();
  }

  /**
   * Filtra el padrón médico cruzando texto libre, especialidad y estado actual.
   */
  aplicarFiltros(): void {
    const q = this.busquedaGlobal.toLowerCase().trim();

    this.medicosFiltrados = this.medicos.filter(m => {
      const matchEsp = this.especialidadFiltro === 'Todas' || m.especialidad === this.especialidadFiltro;
      const matchEstado = this.estadoFiltro === 'Todos' || m.estado === this.estadoFiltro;

      const nombreCompleto = `${m.nombre} ${m.apellido}`.toLowerCase();
      const matchQuery = nombreCompleto.includes(q) ||
                         m.matricula.toLowerCase().includes(q) ||
                         m.especialidad.toLowerCase().includes(q);

      return matchEsp && matchEstado && matchQuery;
    });
  }

  /**
   * Retorna la cantidad de profesionales según su estado institucional.
   */
  contarPorEstado(estado: string): number {
    return this.medicos.filter(m => m.estado === estado).length;
  }

  /**
   * Resetea todos los filtros aplicados a sus valores por defecto.
   */
  resetearFiltros(): void {
    this.busquedaGlobal = '';
    this.especialidadFiltro = 'Todas';
    this.estadoFiltro = 'Todos';
    this.aplicarFiltros();
  }

  /**
   * Redirige al formulario de alta de un nuevo profesional médico.
   */
  abrirModalCrear(): void {
    this.router.navigate(['/admin/medicos/nuevo']);
  }

  /**
   * Visualiza la agenda de turnos asignada al profesional.
   */
  verAgenda(m: MedicoAdmin): void {
    console.log('Ver agenda de turnos para médico ID:', m.id);
  }

  /**
   * Redirige a la pantalla de edición del profesional seleccionado.
   */
  editarMedico(m: MedicoAdmin): void {
    this.router.navigate(['/admin/medicos/editar', m.id]);
  }

  /**
   * Alterna o modifica el estado institucional del profesional.
   */
  cambiarEstadoMedico(m: MedicoAdmin): void {
    console.log('Cambiando estado de médico ID:', m.id);
  }

}