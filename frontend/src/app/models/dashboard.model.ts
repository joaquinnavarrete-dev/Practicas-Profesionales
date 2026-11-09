export interface DemandaEspecialidad {
  nombre: string;
  turnos: number;
  porcentaje: number;
  color: string;
}

export interface ProximoTurno {
  idTurno?: number;
  idPaciente?: number;
  hora: string;
  paciente: string;
  dni: string;
  medico: string;
  especialidad: string;
  obraSocial: string;
  estado: 'En Espera' | 'Confirmado' | 'Atendido' | 'Pendiente de Reubicación' | 'Cancelado' | string;
  motivo?: string;
}

export interface MetricaObraSocial {
  nombre: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

export interface MesRendimiento {
  mesNombre: string;
  totalAtendidos: number;
  totalAusentes: number;
  efectividad: number;
}
