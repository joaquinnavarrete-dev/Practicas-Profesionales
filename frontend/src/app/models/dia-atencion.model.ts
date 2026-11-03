export interface DiaAtencion {
  idDiaAtencion: number;
  idMedico: number;
  diaSemana: string;
  nombreDia?: string;
  horaInicio: string;
  horaFin: string;
  nombreMedico?: string;
}

export interface DiaAtencionRequest {
  idMedico: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
}

export interface HorarioDiaSemana {
  numero: number;
  abrev: string;
  nombre: string;
  activo: boolean;
  horario?: string;
}

export interface FranjaDetalle {
  dia: string;
  horas: string;
}

export interface MedicoAtencion {
  id: number;
  nombre: string;
  especialidad: string;
  subespecialidad: string;
  matricula: string;
  calificacion: number;
  fotoUrl: string;
  diasSemana: string[];
  diasSemanaCuadritos: HorarioDiaSemana[];
  franjasDetalle: FranjaDetalle[];
  franjaHoraria: string;
  consultorio: string;
  proximoDisponible: string;
}
