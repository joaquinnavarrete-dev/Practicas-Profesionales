export interface DemandaEspecialidad {
  nombre: string;
  turnos: number;
  porcentaje: number;
  color: string;
}

export interface ProximoTurno {
  hora: string;
  paciente: string;
  dni: string;
  medico: string;
  especialidad: string;
  obraSocial: string;
  estado: 'En Espera' | 'Confirmado' | 'Atendido';
}

