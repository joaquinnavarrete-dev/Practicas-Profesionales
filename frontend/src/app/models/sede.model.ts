export interface Sede {
    id: number;
    nombre: string;
    direccion: string;
    telefono: string;
    email: string;
    horario_atencion: string;
    activo: boolean;
}

export interface SedeRequest {
    nombre: string;
    direccion: string;
    telefono: string;
    email: string;
    horario_atencion: string;
    activo: boolean;
}

export interface SedeItem {
    id: number;
    nombre: string;
    direccion: string;
    telefono: string;
    email: string;
    horario_atencion: string;
    estado: 'Activa' | 'Inactiva';
}