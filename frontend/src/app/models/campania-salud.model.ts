export interface CampaniaSalud {
    id: number;
    nombre: string;
    descripcion: string;
    fechaInicio: string;
    fechaFin: string;
    publicoObjetivo: string;
    cupoMaximo: number;
    estado: string;
}

export interface CampaniaRequest {
    nombre: string;
    descripcion: string;
    fechaInicio: string;
    fechaFin: string;
    publicoObjetivo: string;
    cupoMaximo: number;
    estado: string;
}