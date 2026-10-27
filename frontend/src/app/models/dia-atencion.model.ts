export interface DiaAtencion {
  idDiaAtencion: number;
  idMedico: number;
  diaSemana: string;
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
