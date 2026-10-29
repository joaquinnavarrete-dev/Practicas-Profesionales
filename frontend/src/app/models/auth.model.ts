export interface AuthRequest {
  nombreUsuario: string;
  password?: string;
  contrasena?: string;
}

export interface AuthResponse {
  token: string;
  tipo: string;
  idUsuario: number;
  nombreUsuario: string;
  rol: string;
  idPaciente?: number;
  idMedico?: number;
}

export interface RegistroPacienteRequest {
  dni: string;
  nombre: string;
  apellido: string;
  telefono: string;
  idObraSocial: number;
  nombreUsuario: string;
  contrasena: string;
}

export interface UsuarioSesion {
  idUsuario: number;
  nombreUsuario: string;
  rol: string;
  idPaciente?: number;
  idMedico?: number;
}
