import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface MedicoAtencion {
  id: number;
  nombre: string;
  especialidad: string;
  subespecialidad: string;
  matricula: string;
  calificacion: number;
  fotoUrl: string;
  diasSemana: string[];
  franjaHoraria: string;
  consultorio: string;
  proximoDisponible: string;
}

@Component({
  selector: 'app-dias-atencion',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dias-atencion.html', // o ./dias-atencion.component.html
  styleUrl: './dias-atencion.css'     // o ./dias-atencion.component.css
})
export class DiasAtencionComponent {
  busquedaGeneral: string = '';
  filtroEspecialidad: string = 'Todas';
  filtroDia: string = 'Todos';

  medicos: MedicoAtencion[] = [
    {
      id: 101,
      nombre: 'Dra. Mariana Gómez',
      especialidad: 'Cardiología',
      subespecialidad: 'Cardiología Clínica y Ergometría',
      matricula: 'M.N. 142.589',
      calificacion: 4.9,
      fotoUrl: '👩‍⚕️',
      diasSemana: ['Lunes', 'Miércoles', 'Viernes'],
      franjaHoraria: '08:00 a 13:00 hs',
      consultorio: 'Consultorio 204 (Piso 2)',
      proximoDisponible: 'Mañana 09:30 hs'
    },
    {
      id: 102,
      nombre: 'Dr. Javier Martínez',
      especialidad: 'Cardiología',
      subespecialidad: 'Ecocardiografía y Doppler',
      matricula: 'M.N. 118.942',
      calificacion: 4.8,
      fotoUrl: '👨‍⚕️',
      diasSemana: ['Martes', 'Jueves'],
      franjaHoraria: '14:00 a 19:00 hs',
      consultorio: 'Consultorio 210',
      proximoDisponible: 'Jueves 24, 14:00 hs'
    },
    {
      id: 103,
      nombre: 'Dr. Roberto Rossi',
      especialidad: 'Neurología',
      subespecialidad: 'Electrofisiología y Cefaleas',
      matricula: 'M.N. 95.310',
      calificacion: 4.9,
      fotoUrl: '👨‍⚕️',
      diasSemana: ['Lunes', 'Viernes'],
      franjaHoraria: '09:00 a 14:00 hs',
      consultorio: 'Consultorio 215',
      proximoDisponible: 'Viernes 25, 10:15 hs'
    },
    {
      id: 104,
      nombre: 'Dra. Sofía Benítez',
      especialidad: 'Pediatría',
      subespecialidad: 'Controles Pediátricos y Vacunación',
      matricula: 'M.N. 156.402',
      calificacion: 4.7,
      fotoUrl: '👩‍⚕️',
      diasSemana: ['Lunes', 'Martes', 'Jueves'],
      franjaHoraria: '13:00 a 18:00 hs',
      consultorio: 'Consultorio 108',
      proximoDisponible: 'Lunes 28, 16:30 hs'
    }
  ];

  listaFiltrada: MedicoAtencion[] = [...this.medicos];

  filtrar() {
    const q = this.busquedaGeneral.toLowerCase().trim();
    this.listaFiltrada = this.medicos.filter(m => {
      const matchBusqueda = m.nombre.toLowerCase().includes(q) || 
                            m.subespecialidad.toLowerCase().includes(q);
      const matchEsp = this.filtroEspecialidad === 'Todas' || m.especialidad === this.filtroEspecialidad;
      const matchDia = this.filtroDia === 'Todos' || m.diasSemana.includes(this.filtroDia);

      return matchBusqueda && matchEsp && matchDia;
    });
  }

  resetearFiltros() {
    this.busquedaGeneral = '';
    this.filtroEspecialidad = 'Todas';
    this.filtroDia = 'Todos';
    this.listaFiltrada = [...this.medicos];
  }
}