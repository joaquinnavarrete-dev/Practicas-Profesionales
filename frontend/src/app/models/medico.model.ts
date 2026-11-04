import { Especialidad } from './especialidad.model';

export interface Medico {
  idMedico: number;
  matricula: string;
  nombre: string;
  apellido: string;
  telefono: string;
  especialidad: Especialidad;
  idUsuario?: number;
  nombreUsuario?: string;
}

export interface MedicoRequest {
  matricula: string;
  nombre: string;
  apellido: string;
  telefono: string;
  idEspecialidad: number;
  idUsuario?: number;
}

export interface MedicoInfo {
  id: number;
  nombre: string;
  especialidad: string;
  subespecialidad: string;
  matricula: string;
  consultorio: string;
  fotoUrl: string;
}
