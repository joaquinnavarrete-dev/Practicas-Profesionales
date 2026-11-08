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

export interface HorarioCartelera {
  diaNombre: string;
  horaInicio: string;
  horaFin: string;
}

export interface MedicoCartelera {
  idMedico: number;
  nombreCompleto: string;
  especialidad: string;
  consultorio: string;
  telefono: string;
  horarios: HorarioCartelera[];
}

export interface ColegaMedicoCard {
  idMedico: number;
  nombreCompleto: string;
  especialidad: string;
  matricula: string;
  telefono: string;
  consultorio: string;
  diasAtencion: string[];
}
