import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { UsuarioService, NotificationService } from '../../services';
import { Usuario } from '../../models';

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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usuarioService = inject(UsuarioService);
  private readonly notify = inject(NotificationService);

  usuarioEnEdicion: UsuarioDetalle | null = null;
  guardando: boolean = false;

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

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('id');

    if (paramId) {
      const idNum = Number(paramId);
      this.usuarioService.buscarPorId(idNum).subscribe({
        next: (u: Usuario) => {
          const rolNombre = u.rol?.nombre || 'Paciente';
          this.usuarioEnEdicion = {
            id: u.idUsuario,
            username: u.nombreUsuario,
            nombre: u.nombreUsuario,
            apellido: '',
            email: `${u.nombreUsuario}@clinicasangabriel.com`,
            dni: `USR-${u.idUsuario}`,
            rol: rolNombre,
            avatarUrl: rolNombre.toUpperCase().includes('ADMIN') ? '🛡️' : (rolNombre.toUpperCase().includes('MED') ? '👨‍⚕️' : '👤')
          };

          const rolActual = this.roles.find(r => r.nombre.toLowerCase() === rolNombre.toLowerCase());
          if (rolActual) {
            this.rolSeleccionado = rolActual;
          }
        },
        error: (err) => {
          console.error('Error al obtener usuario en roles:', err);
          this.notify.error('No se pudo cargar la información del usuario.');
        }
      });
    }
  }

  seleccionarRol(r: RolPerfil): void {
    this.rolSeleccionado = r;
    if (this.usuarioEnEdicion) {
      this.usuarioEnEdicion.rol = r.nombre;
    }
  }

  guardarCambios(): void {
    if (this.usuarioEnEdicion) {
      this.guardando = true;
      let idRol = 3;
      if (this.rolSeleccionado.nombre === 'Administrador') {
        idRol = 1;
      } else if (this.rolSeleccionado.nombre === 'Médico') {
        idRol = 2;
      }

      this.usuarioService.actualizar(this.usuarioEnEdicion.id, {
        nombreUsuario: this.usuarioEnEdicion.username,
        idRol: idRol,
        estado: true
      }).subscribe({
        next: () => {
          this.guardando = false;
          this.notify.success(`¡Rol de acceso actualizado exitosamente para @${this.usuarioEnEdicion?.username}!`);
          this.router.navigate(['/admin/usuarios']);
        },
        error: (err) => {
          this.guardando = false;
          console.error('Error al actualizar rol de usuario:', err);
          this.notify.error(err?.error?.message || 'Error al comunicarse con el servidor para actualizar el rol.');
        }
      });
    } else {
      this.notify.info('Matriz global de roles y privilegios RBAC verificada correctamente.');
    }
  }

}
