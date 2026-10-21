import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

export interface TurnoAdminRow {
  id: number;
  hora: string;
  fecha: string;
  pacienteNombre: string;
  pacienteDni: string;
  medicoNombre: string;
  especialidad: string;
  obraSocial: string;
  plan: string;
  motivo: string;
  estado: 'Confirmado' | 'En Espera' | 'Atendido' | 'Cancelado';
}

@Component({
  selector: 'app-turnos-admin',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './turnos-admin.html',
  styleUrl: './turnos-admin.css'
})
export class TurnosAdminComponent {

  busquedaGlobal: string = '';
  fechaFiltro: string = '2025-10-22';
  estadoFiltro: string = 'Todos';
  especialidadFiltro: string = 'Todas';

  turnos: TurnoAdminRow[] = [
    {
      id: 1,
      hora: '08:30 hs',
      fecha: '2025-10-22',
      pacienteNombre: 'Carlos Eduardo Fernández',
      pacienteDni: '28.452.109',
      medicoNombre: 'Dra. Mariana Gómez',
      especialidad: 'Cardiología',
      obraSocial: 'OSDE',
      plan: 'Plan 310',
      motivo: 'Control post-operatorio',
      estado: 'Atendido'
    },
    {
      id: 2,
      hora: '09:00 hs',
      fecha: '2025-10-22',
      pacienteNombre: 'Laura Rodríguez',
      pacienteDni: '34.567.890',
      medicoNombre: 'Dra. Mariana Gómez',
      especialidad: 'Cardiología',
      obraSocial: 'Swiss Medical',
      plan: 'Plan Sual',
      motivo: 'Evaluación ergométrica',
      estado: 'En Espera'
    },
    {
      id: 3,
      hora: '09:30 hs',
      fecha: '2025-10-22',
      pacienteNombre: 'Martín Gonzalo Peralta',
      pacienteDni: '40.128.943',
      medicoNombre: 'Dra. Mariana Gómez',
      especialidad: 'Cardiología',
      obraSocial: 'Galeno',
      plan: 'Oro 450',
      motivo: 'Ecocardiograma de rutina',
      estado: 'Confirmado'
    },
    {
      id: 4,
      hora: '10:15 hs',
      fecha: '2025-10-22',
      pacienteNombre: 'Elena Beatríz Rossi',
      pacienteDni: '22.940.182',
      medicoNombre: 'Dr. Roberto Rossi',
      especialidad: 'Neurología',
      obraSocial: 'PAMI',
      plan: 'Beneficiario',
      motivo: 'Consulta por cefaleas recurrentes',
      estado: 'Confirmado'
    },
    {
      id: 5,
      hora: '11:00 hs',
      fecha: '2025-10-22',
      pacienteNombre: 'Lucas Torres',
      pacienteDni: '38.904.211',
      medicoNombre: 'Dra. Sofía Benítez',
      especialidad: 'Pediatría',
      obraSocial: 'Particular',
      plan: 'Sin Cobertura',
      motivo: 'Control pediátrico',
      estado: 'Cancelado'
    }
  ];

  turnosFiltrados: TurnoAdminRow[] = [...this.turnos];

  constructor() {
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    const q = this.busquedaGlobal.toLowerCase().trim();

    this.turnosFiltrados = this.turnos.filter(t => {
      const matchFecha = !this.fechaFiltro || t.fecha === this.fechaFiltro;
      const matchEstado = this.estadoFiltro === 'Todos' || t.estado === this.estadoFiltro;
      const matchEsp = this.especialidadFiltro === 'Todas' || t.especialidad === this.especialidadFiltro;
      const matchQuery = t.pacienteNombre.toLowerCase().includes(q) ||
                          t.pacienteDni.includes(q) ||
                          t.medicoNombre.toLowerCase().includes(q) ||
                          t.especialidad.toLowerCase().includes(q);

      return matchFecha && matchEstado && matchEsp && matchQuery;
    });
  }

  contarPorEstado(estado: string): number {
    return this.turnos.filter(t => t.estado === estado).length;
  }

  resetearFiltros() {
    this.busquedaGlobal = '';
    this.fechaFiltro = '2025-10-22';
    this.estadoFiltro = 'Todos';
    this.especialidadFiltro = 'Todas';
    this.aplicarFiltros();
  }

  verDetalleTurno(t: TurnoAdminRow) {
    console.log('Ver detalle del turno ID:', t.id);
  }

  cambiarEstado(t: TurnoAdminRow) {
    console.log('Cambiar estado del turno ID:', t.id);
  }

  cancelarTurno(t: TurnoAdminRow) {
    console.log('Cancelar turno ID:', t.id);
  }
}