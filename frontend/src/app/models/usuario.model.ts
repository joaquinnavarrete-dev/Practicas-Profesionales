export interface Rol {
  idRol: number;
  nombre: string;
}

export interface RolRequest {
  nombre: string;
}

export interface Usuario {
  idUsuario: number;
  nombreUsuario: string;
  rol: Rol;
  estado: boolean;
}

export interface UsuarioRequest {
  nombreUsuario: string;
  password?: string;
  idRol: number;
  estado: boolean;
}
