import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-editar-medico-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './editar-medico-admin.html',
  styleUrl: './editar-medico-admin.css'
})
export class EditarMedicoAdminComponent implements OnInit {

  medicoId: string | null = null;

  // Objeto DTO precargable para enviar a Spring Boot (PUT /api/medicos/{id})
  medicoForm = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    matricula: '',
    especialidad: 'Cardiología',
    subespecialidad: '',
    consultorio: 'Consultorio 204 (Piso 2)',
    diasAtencion: '',
    estado: 'Activo'
  };

  // Base de datos mock temporal (simulando los médicos que tenés en la grilla principal)
  private medicosMockBD = [
    {
      id: 101,
      nombre: 'Mariana',
      apellido: 'Gómez',
      email: 'mariana.gomez@sangabriel.com',
      telefono: '+54 9 11 4402-9911',
      matricula: 'M.N. 142.589',
      especialidad: 'Cardiología',
      subespecialidad: 'Cardiología Clínica y Ergometría',
      consultorio: 'Consultorio 204 (Piso 2)',
      diasAtencion: 'Lun, Mié y Vie (08:00 a 13:00 hs)',
      estado: 'Activo'
    },
    {
      id: 102,
      nombre: 'Javier',
      apellido: 'Martínez',
      email: 'javier.martinez@sangabriel.com',
      telefono: '+54 9 11 5501-2244',
      matricula: 'M.N. 118.942',
      especialidad: 'Cardiología',
      subespecialidad: 'Ecocardiografía y Doppler',
      consultorio: 'Consultorio 210 (Piso 2)',
      diasAtencion: 'Mar y Jue (14:00 a 19:00 hs)',
      estado: 'Activo'
    },
    {
      id: 103,
      nombre: 'Roberto',
      apellido: 'Rossi',
      email: 'roberto.rossi@sangabriel.com',
      telefono: '+54 9 11 6612-8833',
      matricula: 'M.N. 95.310',
      especialidad: 'Neurología',
      subespecialidad: 'Electrofisiología y Cefaleas',
      consultorio: 'Consultorio 215 (Piso 2)',
      diasAtencion: 'Lun y Vie (10:00 a 15:00 hs)',
      estado: 'Activo'
    },
    {
      id: 104,
      nombre: 'Sofía',
      apellido: 'Benítez',
      email: 'sofia.benitez@sangabriel.com',
      telefono: '+54 9 11 3320-1199',
      matricula: 'M.N. 156.402',
      especialidad: 'Pediatría',
      subespecialidad: 'Pediatría General y Neonatología',
      consultorio: 'Consultorio 102 (Piso 1)',
      diasAtencion: 'Mar, Mié y Jue (09:00 a 14:00 hs)',
      estado: 'Licencia'
    },
    {
      id: 105,
      nombre: 'Gonzalo',
      apellido: 'Alvarez',
      email: 'gonzalo.alvarez@sangabriel.com',
      telefono: '+54 9 11 7741-0022',
      matricula: 'M.N. 104.821',
      especialidad: 'Traumatología',
      subespecialidad: 'Artroscopia y Cirugía de Rodilla',
      consultorio: 'Consultorio 301 (Piso 3)',
      diasAtencion: 'Mié y Jue (15:00 a 20:00 hs)',
      estado: 'Inactivo'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Captura el ID del médico enviado por parámetro en la URL
    this.medicoId = this.route.snapshot.paramMap.get('id');

    if (this.medicoId) {
      const idNum = Number(this.medicoId);
      console.log('Buscando datos para modificar al médico con ID:', idNum);
      
      // Buscamos el médico en nuestra "base de datos" mock
      const medicoEncontrado = this.medicosMockBD.find(m => m.id === idNum);

      if (medicoEncontrado) {
        // Precargamos el formulario con los datos reales del médico seleccionado
        this.medicoForm = { ...medicoEncontrado };
      } else {
        console.warn('No se encontró ningún médico con ese ID en el mock.');
      }
    }
  }

  // Acción para enviar las modificaciones al backend
  actualizarMedico(): void {
    console.log(`Enviando modificaciones del médico ID ${this.medicoId} a Spring Boot (PUT /api/medicos/${this.medicoId}):`, this.medicoForm);
    alert('¡Modificaciones guardadas con éxito!');
    
    // Redirige de regreso al padrón del cuerpo médico
    this.router.navigate(['/admin/medicos']);
  }

}