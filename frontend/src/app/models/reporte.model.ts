export interface ReporteItemEspecialidad {
  nombre: string;
  totalTurnos: number;
  atendidos: number;
  ausentes: number;
  efectividad: number;
}

export interface ReporteItemMedico {
  nombre: string;
  especialidad: string;
  totalTurnos: number;
  atendidos: number;
  ausentes: number;
  efectividad: number;
}

export interface ReporteItemObraSocial {
  nombre: string;
  totalTurnos: number;
  porcentaje: number;
}

