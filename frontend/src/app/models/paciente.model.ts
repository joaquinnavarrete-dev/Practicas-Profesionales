import { ObraSocial } from './obra-social.model';

export interface Paciente {
  idPaciente: number;
  dni: string;
  nombre: string;
  apellido: string;
  telefono: string;
  obraSocial: ObraSocial;
  idUsuario?: number;
}

export interface PacienteRequest {
  dni: string;
  nombre: string;
  apellido: string;
  telefono: string;
  idObraSocial: number;
  idUsuario?: number;
}

export interface ActualizarPerfilPacienteRequest {
  nombre: string;
  apellido: string;
  telefono: string;
  idObraSocial: number;
}
