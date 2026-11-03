export interface PermisoModulo {
  nombreModulo: string;
  descripcion: string;
  leer: boolean;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
}

export interface RolPerfil {
  id: number;
  nombre: string;
  icono: string;
  descripcion: string;
  cantidadUsuarios: number;
  modulos: PermisoModulo[];
}

export interface UsuarioDetalle {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  rol: string;
  avatarUrl: string;
}

