export interface Especialidad {
  idEspecialidad: number;
  nombre: string;
  icono?: string;
}

export interface EspecialidadRequest {
  nombre: string;
}

export interface EspecialidadRow {
  id: number;
  nombre: string;
  departamento: string;
  duracion: number;
  medicos: number;
  estado: string;
  icono: string;
  bgClase: string;
}

export interface EspecialidadItem {
  id: number;
  nombre: string;
  descripcion: string;
  atencion24hs: boolean;
  icono: string;
  colorClase: string;
  etiquetas: string[];
}
