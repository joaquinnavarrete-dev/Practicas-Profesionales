import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';

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

@Component({
  selector: 'app-roles-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './roles-admin.html',
  styleUrl: './roles-admin.css'
})
export class RolesAdminComponent implements OnInit {

  // Usuario que se está editando (null si es configuración global)
  usuarioEnEdicion: UsuarioDetalle | null = null;

  // Lista mock de usuarios para simular el GET /api/usuarios/{id}
  usuariosBase: UsuarioDetalle[] = [
    { id: 1, username: 'mgomez', nombre: 'Mariana', apellido: 'Gómez', email: 'mariana.gomez@sangabriel.com', dni: '28.452.109', rol: 'Administrador', avatarUrl: '👩‍⚕️' },
    { id: 2, username: 'jmartinez', nombre: 'Javier', apellido: 'Martínez', email: 'javier.martinez@sangabriel.com', dni: '30.128.940', rol: 'Médico', avatarUrl: '👨‍⚕️' },
    { id: 3, username: 'lrodriguez', nombre: 'Laura', apellido: 'Rodríguez', email: 'laura.rodriguez@email.com', dni: '34.567.890', rol: 'Paciente', avatarUrl: '👩' },
    { id: 4, username: 'recepcion_central', nombre: 'Ana María', apellido: 'Sosa', email: 'recepcion@sangabriel.com', dni: '31.402.109', rol: 'Recepción', avatarUrl: '👩‍💼' }
  ];

  roles: RolPerfil[] = [
    {
      id: 1,
      nombre: 'Administrador',
      icono: '🛡️',
      descripcion: 'Acceso total a todos los módulos y configuraciones del sistema.',
      cantidadUsuarios: 2,
      modulos: [
        { nombreModulo: 'Gestión de Turnos', descripcion: 'Control general de la agenda de turnos', leer: true, crear: true, editar: true, eliminar: true },
        { nombreModulo: 'Pacientes', descripcion: 'Historias clínicas y datos de contacto', leer: true, crear: true, editar: true, eliminar: true },
        { nombreModulo: 'Cuerpo Médico', descripcion: 'Padrón de profesionales y consultorios', leer: true, crear: true, editar: true, eliminar: true },
        { nombreModulo: 'Especialidades', descripcion: 'Catálogo de especialidades médicas', leer: true, crear: true, editar: true, eliminar: true },
        { nombreModulo: 'Obras Sociales', descripcion: 'Convenios y copagos institucionales', leer: true, crear: true, editar: true, eliminar: true },
        { nombreModulo: 'Usuarios y Roles', descripcion: 'Control de accesos y seguridad RBAC', leer: true, crear: true, editar: true, eliminar: true }
      ]
    },
    {
      id: 2,
      nombre: 'Médico',
      icono: '🩺',
      descripcion: 'Acceso a la agenda propia, citados e historias clínicas.',
      cantidadUsuarios: 14,
      modulos: [
        { nombreModulo: 'Gestión de Turnos', descripcion: 'Ver turnos citados en sus consultorios', leer: true, crear: false, editar: true, eliminar: false },
        { nombreModulo: 'Pacientes', descripcion: 'Ver historia clínica de sus pacientes', leer: true, crear: false, editar: true, eliminar: false },
        { nombreModulo: 'Cuerpo Médico', descripcion: 'Ver la nómina de colegas', leer: true, crear: false, editar: false, eliminar: false },
        { nombreModulo: 'Especialidades', descripcion: 'Consultar especialidades', leer: true, crear: false, editar: false, eliminar: false },
        { nombreModulo: 'Obras Sociales', descripcion: 'Consultar coberturas admitidas', leer: true, crear: false, editar: false, eliminar: false },
        { nombreModulo: 'Usuarios y Roles', descripcion: 'Sin acceso', leer: false, crear: false, editar: false, eliminar: false }
      ]
    },
    {
      id: 3,
      nombre: 'Recepción',
      icono: '👩‍💼',
      descripcion: 'Atención al público, recepción de pacientes y asignación de turnos.',
      cantidadUsuarios: 5,
      modulos: [
        { nombreModulo: 'Gestión de Turnos', descripcion: 'Agendar, cambiar estado y cancelar citas', leer: true, crear: true, editar: true, eliminar: true },
        { nombreModulo: 'Pacientes', descripcion: 'Dar de alta y actualizar datos personales', leer: true, crear: true, editar: true, eliminar: false },
        { nombreModulo: 'Cuerpo Médico', descripcion: 'Consultar grilla y días de atención', leer: true, crear: false, editar: false, eliminar: false },
        { nombreModulo: 'Especialidades', descripcion: 'Consultar catálogo', leer: true, crear: false, editar: false, eliminar: false },
        { nombreModulo: 'Obras Sociales', descripcion: 'Consultar copagos y planes', leer: true, crear: false, editar: false, eliminar: false },
        { nombreModulo: 'Usuarios y Roles', descripcion: 'Sin acceso', leer: false, crear: false, editar: false, eliminar: false }
      ]
    },
    {
      id: 4,
      nombre: 'Paciente',
      icono: '👤',
      descripcion: 'Perfil público para autogestión de turnos e historia básica.',
      cantidadUsuarios: 1480,
      modulos: [
        { nombreModulo: 'Gestión de Turnos', descripcion: 'Solicitar y cancelar turnos propios', leer: true, crear: true, editar: false, eliminar: true },
        { nombreModulo: 'Pacientes', descripcion: 'Ver y modificar mis datos personales', leer: true, crear: false, editar: true, eliminar: false },
        { nombreModulo: 'Cuerpo Médico', descripcion: 'Ver cartilla de médicos', leer: true, crear: false, editar: false, eliminar: false },
        { nombreModulo: 'Especialidades', descripcion: 'Ver especialidades públicas', leer: true, crear: false, editar: false, eliminar: false },
        { nombreModulo: 'Obras Sociales', descripcion: 'Ver prestadores', leer: true, crear: false, editar: false, eliminar: false },
        { nombreModulo: 'Usuarios y Roles', descripcion: 'Sin acceso', leer: false, crear: false, editar: false, eliminar: false }
      ]
    }
  ];

  rolSeleccionado: RolPerfil = this.roles[0];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Detecta si vino un ID por la ruta
    const paramId = this.route.snapshot.paramMap.get('id');

    if (paramId) {
      const idNum = Number(paramId);
      const encontrado = this.usuariosBase.find(u => u.id === idNum);

      if (encontrado) {
        this.usuarioEnEdicion = encontrado;
        // Selecciona automáticamente la tarjeta de rol que tiene asignada el usuario
        const rolActual = this.roles.find(r => r.nombre.toLowerCase() === encontrado.rol.toLowerCase());
        if (rolActual) {
          this.rolSeleccionado = rolActual;
        }
      }
    }
  }

  // Permite cambiarle el rol al usuario haciendo clic en otra tarjeta
  seleccionarRol(r: RolPerfil): void {
    this.rolSeleccionado = r;
    if (this.usuarioEnEdicion) {
      this.usuarioEnEdicion.rol = r.nombre;
    }
  }

  guardarCambios(): void {
    if (this.usuarioEnEdicion) {
      console.log(`Guardando cambios para el usuario @${this.usuarioEnEdicion.username}: Nuevo Rol = ${this.usuarioEnEdicion.rol}`);
    } else {
      console.log('Guardando matriz global de roles.');
    }
  }

}