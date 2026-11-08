import { Turno } from './turno.model';

export interface DiaCalendario {
  fechaStr: string;
  numeroDia: number;
  esMesActual: boolean;
  esPasado: boolean;
  esHoy: boolean;
  atiendeMedico: boolean;
  estaSeleccionado: boolean;
}

export interface DiaAgendaSemanal {
  fechaIso: string;
  nombreDia: string;
  diaMes: number;
  esHoy: boolean;
  turnos: Turno[];
}

