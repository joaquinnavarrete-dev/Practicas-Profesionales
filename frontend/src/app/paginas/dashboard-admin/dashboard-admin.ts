import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Estructura para el gráfico/barra de demanda por especialidad
export interface DemandaEspecialidad {
  nombre: string;
  turnos: number;
  porcentaje: number;
  color: string;
}

// Estructura para la tabla de próximos turnos en recepción
export interface ProximoTurno {
  hora: string;
  paciente: string;
  dni: string;
  medico: string;
  especialidad: string;
  obraSocial: string;
  estado: 'En Espera' | 'Confirmado' | 'Atendido';
}

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css'
})
export class DashboardAdminComponent {

  // Muestra el porcentaje de ocupación por especialidad en las barras del dashboard
  // Futuro endpoint: GET /api/dashboard/demanda-especialidades
  demandaEspecialidades: DemandaEspecialidad[] = [
    { nombre: 'Cardiología', turnos: 18, porcentaje: 38, color: '#004b93' },
    { nombre: 'Pediatría', turnos: 12, porcentaje: 25, color: '#0284c7' },
    { nombre: 'Traumatología', turnos: 10, porcentaje: 21, color: '#0f766e' },
    { nombre: 'Neurología', turnos: 8, porcentaje: 16, color: '#7e22ce' }
  ];

  // Listado de los turnos más inmediatos para la tabla resumen de recepción
  // Futuro endpoint: GET /api/dashboard/proximos-turnos
  proximosTurnos: ProximoTurno[] = [
    {
      hora: '09:00 hs',
      paciente: 'Laura Rodríguez',
      dni: '34.567.890',
      medico: 'Dra. Mariana Gómez',
      especialidad: 'Cardiología',
      obraSocial: 'Swiss Medical',
      estado: 'En Espera'
    },
    {
      hora: '09:30 hs',
      paciente: 'Martín Gonzalo Peralta',
      dni: '40.128.943',
      medico: 'Dra. Mariana Gómez',
      especialidad: 'Cardiología',
      obraSocial: 'Galeno',
      estado: 'Confirmado'
    },
    {
      hora: '09:30 hs',
      paciente: 'Patricia Benítez',
      dni: '29.104.882',
      medico: 'Dr. Javier Martínez',
      especialidad: 'Cardiología',
      obraSocial: 'OSDE',
      estado: 'Confirmado'
    },
    {
      hora: '10:15 hs',
      paciente: 'Elena Beatríz Rossi',
      dni: '22.940.182',
      medico: 'Dr. Roberto Rossi',
      especialidad: 'Neurología',
      obraSocial: 'PAMI',
      estado: 'Confirmado'
    }
  ];

}