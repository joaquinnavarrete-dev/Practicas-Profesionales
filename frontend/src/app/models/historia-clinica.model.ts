import { Paciente } from './paciente.model';
import { Medico } from './medico.model';

export interface HistoriaClinica {
  idHistoriaClinica: number;
  idPaciente: number;
  paciente?: Paciente;
  idMedico: number;
  medico?: Medico;
  idTurno?: number;
  fecha: string;
  motivoConsulta: string;
  diagnostico: string;
  tratamiento?: string;
  observaciones?: string;
}

export interface HistoriaClinicaRequest {
  idPaciente: number;
  idMedico: number;
  idTurno?: number;
  fecha: string;
  motivoConsulta: string;
  diagnostico: string;
  tratamiento?: string;
  observaciones?: string;
}

