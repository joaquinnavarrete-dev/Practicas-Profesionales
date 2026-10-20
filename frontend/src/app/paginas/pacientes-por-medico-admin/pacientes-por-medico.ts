import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface MedicoInfo {
  id: number;
  nombre: string;
  especialidad: string;
  subespecialidad: string;
  matricula: string;
  consultorio: string;
  fotoUrl: string;
}

export interface PacienteCita {
  id: number;
  medicoId: number;
  hora: string;
  nombre: string;
  dni: string;
  numHistoriaClinica: string;
  telefono: string;
  obraSocial: string;
  planAfiliado: string;
  motivo: string;
  estado: 'Confirmado' | 'En Espera' | 'Atendido' | 'Ausente';
  fecha: string;
}

@Component({
  selector: 'app-pacientes-por-medico',
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes-por-medico.html',
  styleUrl: './pacientes-por-medico.css'
})
export class PacientesPorMedicoComponent {

  busquedaGlobal: string = '';
  medicoSeleccionadoId: number = 101;
  fechaFiltro: string = '2025-10-22';
  estadoFiltro: string = 'Todos';

  medicos: MedicoInfo[] = [
    {
      id: 101,
      nombre: 'Dra. Mariana Gómez',
      especialidad: 'Cardiología',
      subespecialidad: 'Cardiología Clínica y Ergometría',
      matricula: 'M.N. 142.589',
      consultorio: 'Consultorio 204 (Piso 2)',
      fotoUrl: '👩‍⚕️'
    },
    {
      id: 102,
      nombre: 'Dr. Javier Martínez',
      especialidad: 'Cardiología',
      subespecialidad: 'Ecocardiografía y Doppler',
      matricula: 'M.N. 118.942',
      consultorio: 'Consultorio 210',
      fotoUrl: '👨‍⚕️'
    },
    {
      id: 103,
      nombre: 'Dr. Roberto Rossi',
      especialidad: 'Neurología',
      subespecialidad: 'Electrofisiología y Cefaleas',
      matricula: 'M.N. 95.310',
      consultorio: 'Consultorio 215',
      fotoUrl: '👨‍⚕️'
    }
  ];

  pacientes: PacienteCita[] = [
    {
      id: 1,
      medicoId: 101,
      hora: '08:30 hs',
      nombre: 'Carlos Eduardo Fernández',
      dni: '28.452.109',
      numHistoriaClinica: 'HC-84201',
      telefono: '+54 9 11 5821-9042',
      obraSocial: 'OSDE',
      planAfiliado: 'Plan 310 • N° 482109',
      motivo: 'Control post-operatorio de colocación de stent',
      estado: 'Atendido',
      fecha: '2025-10-22'
    },
    {
      id: 2,
      medicoId: 101,
      hora: '09:00 hs',
      nombre: 'Laura Rodríguez',
      dni: '34.567.890',
      numHistoriaClinica: 'HC-90412',
      telefono: '+54 9 11 4567-8900',
      obraSocial: 'Swiss Medical',
      planAfiliado: 'Plan Sual • N° 108422',
      motivo: 'Evaluación de hipertensión arterial y ergometría',
      estado: 'En Espera',
      fecha: '2025-10-22'
    },
    {
      id: 3,
      medicoId: 101,
      hora: '09:30 hs',
      nombre: 'Martín Gonzalo Peralta',
      dni: '40.128.943',
      numHistoriaClinica: 'HC-10482',
      telefono: '+54 9 11 3104-5829',
      obraSocial: 'Galeno',
      planAfiliado: 'Oro 450 • N° 994012',
      motivo: 'Revisión de holter y ecocardiograma',
      estado: 'Confirmado',
      fecha: '2025-10-22'
    },
    {
      id: 4,
      medicoId: 101,
      hora: '10:15 hs',
      nombre: 'Elena Beatríz Rossi',
      dni: '22.940.182',
      numHistoriaClinica: 'HC-34901',
      telefono: '+54 9 11 6940-1122',
      obraSocial: 'PAMI',
      planAfiliado: 'Beneficiario N° 0029482',
      motivo: 'Consulta preventiva cardiometabólica',
      estado: 'Confirmado',
      fecha: '2025-10-22'
    },
    {
      id: 5,
      medicoId: 101,
      hora: '11:00 hs',
      nombre: 'Lucas Nahuel Torres',
      dni: '38.904.211',
      numHistoriaClinica: 'HC-77401',
      telefono: '+54 9 11 2049-8833',
      obraSocial: 'Particular',
      planAfiliado: 'Sin cobertura',
      motivo: 'Apto físico deportivo para gimnasio',
      estado: 'Ausente',
      fecha: '2025-10-22'
    },
    {
      id: 6,
      medicoId: 102,
      hora: '14:00 hs',
      nombre: 'Agustina Morales',
      dni: '36.402.109',
      numHistoriaClinica: 'HC-61029',
      telefono: '+54 9 11 8842-1049',
      obraSocial: 'Omint',
      planAfiliado: 'Plan Premium',
      motivo: 'Ecocardiograma Doppler de control',
      estado: 'Confirmado',
      fecha: '2025-10-22'
    }
  ];

  medicoActual: MedicoInfo | undefined;
  pacientesFiltrados: PacienteCita[] = [];

  constructor() {
    this.alCambiarMedico();
  }

  alCambiarMedico() {
    this.medicoActual = this.medicos.find(m => m.id === Number(this.medicoSeleccionadoId));
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    const query = this.busquedaGlobal.toLowerCase().trim();

    this.pacientesFiltrados = this.pacientes.filter(p => {
      const coincideMedico = p.medicoId === Number(this.medicoSeleccionadoId);
      const coincideFecha = !this.fechaFiltro || p.fecha === this.fechaFiltro;
      const coincideEstado = this.estadoFiltro === 'Todos' || p.estado === this.estadoFiltro;
      const coincideQuery = p.nombre.toLowerCase().includes(query) ||
                            p.dni.includes(query) ||
                            p.numHistoriaClinica.toLowerCase().includes(query);

      return coincideMedico && coincideFecha && coincideEstado && coincideQuery;
    });
  }

  contarPorEstado(estado: string): number {
    return this.pacientes.filter(p => p.medicoId === Number(this.medicoSeleccionadoId) && p.estado === estado).length;
  }

  resetearFiltros() {
    this.busquedaGlobal = '';
    this.fechaFiltro = '2025-10-22';
    this.estadoFiltro = 'Todos';
    this.aplicarFiltros();
  }

  exportarListado() {
    console.log('Exportando listado de pacientes para médico ID:', this.medicoSeleccionadoId);
  }

  verHistoriaClinica(p: PacienteCita) {
    console.log('Ver Historia Clínica de:', p.nombre);
  }

  cambiarEstado(p: PacienteCita) {
    console.log('Cambiar estado del turno ID:', p.id);
  }
}