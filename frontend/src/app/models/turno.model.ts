import { Especialidad } from './especialidad.model';
import { Medico } from './medico.model';
import { Paciente } from './paciente.model';

export interface Turno {
  idTurno: number;
  paciente: Paciente;
  medico: Medico;
  especialidad: Especialidad;
  fecha: string;
  hora: string;
}

export interface TurnoRequest {
  idPaciente: number;
  idMedico: number;
  idEspecialidad: number;
  fecha: string;
  hora: string;
}

export interface SolicitarTurnoRequest {
  idMedico: number;
  idEspecialidad: number;
  fecha: string;
  hora: string;
}

export interface ReprogramarTurnoRequest {
  nuevaFecha: string;
  nuevaHora: string;
}

export interface TurnoDisponible {
  fecha: string;
  hora: string;
  disponible: boolean;
}
