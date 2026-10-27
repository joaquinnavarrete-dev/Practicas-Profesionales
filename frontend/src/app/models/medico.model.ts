import { Especialidad } from './especialidad.model';

export interface Medico {
  idMedico: number;
  matricula: string;
  nombre: string;
  apellido: string;
  telefono: string;
  especialidad: Especialidad;
  idUsuario?: number;
}

export interface MedicoRequest {
  matricula: string;
  nombre: string;
  apellido: string;
  telefono: string;
  idEspecialidad: number;
  idUsuario?: number;
}
