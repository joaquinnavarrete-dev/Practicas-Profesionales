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
  activo?: boolean;
  estado?: boolean;
}

export interface UsuarioRequest {
  nombreUsuario: string;
  password?: string;
  contrasena?: string;
  idRol: number;
  activo?: boolean;
  estado?: boolean;
}

export interface UsuarioSistema {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  rol: string;
  ultimoIngreso: string;
  estado: 'Activo' | 'Bloqueado';
  avatarUrl: string;
}
