import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { UsuarioService, NotificationService, ConfirmModalService } from '../../services';
import { Usuario } from '../../models';

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

@Component({
  selector: 'app-usuarios-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './usuarios-admin.html',
  styleUrl: './usuarios-admin.css'
})
export class UsuariosAdminComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly usuarioService = inject(UsuarioService);
  private readonly notify = inject(NotificationService);
  private readonly confirmModal = inject(ConfirmModalService);

  busquedaGlobal: string = '';
  rolFiltro: string = 'Todos';
  estadoFiltro: string = 'Todos';
  cargando: boolean = false;

  usuarios: UsuarioSistema[] = [];
  usuariosFiltrados: UsuarioSistema[] = [];

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.usuarioService.listar().subscribe({
      next: (data: Usuario[]) => {
        this.usuarios = data.map(u => this.mapearUsuario(u));
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al listar usuarios desde Spring Boot:', err);
        this.cargando = false;
      }
    });
  }

  private mapearUsuario(u: Usuario): UsuarioSistema {
    const rolNombre = u.rol?.nombre || 'PACIENTE';
    let rolNormalizado = 'Paciente';
    let avatar = '👤';

    const r = rolNombre.toUpperCase();
    if (r.includes('ADMIN')) {
      rolNormalizado = 'Administrador';
      avatar = '🛡️';
    } else if (r.includes('MEDIC') || r.includes('DOCTOR')) {
      rolNormalizado = 'Médico';
      avatar = '👨‍⚕️';
    } else if (r.includes('RECEPC') || r.includes('SECRETAR')) {
      rolNormalizado = 'Recepción';
      avatar = '👩‍💼';
    }

    return {
      id: u.idUsuario,
      username: u.nombreUsuario,
      nombre: u.nombreUsuario,
      apellido: '',
      email: `${u.nombreUsuario}@clinicasangabriel.com`,
      dni: `USR-${u.idUsuario}`,
      rol: rolNormalizado,
      ultimoIngreso: 'Reciente',
      estado: u.estado ? 'Activo' : 'Bloqueado',
      avatarUrl: avatar
    };
  }

  aplicarFiltros(): void {
    const q = this.busquedaGlobal.toLowerCase().trim();

    this.usuariosFiltrados = this.usuarios.filter(u => {
      const matchRol = this.rolFiltro === 'Todos' || u.rol === this.rolFiltro;
      const matchEstado = this.estadoFiltro === 'Todos' || u.estado === this.estadoFiltro;
      const matchQuery = !q || 
        u.nombre.toLowerCase().includes(q) || 
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);

      return matchRol && matchEstado && matchQuery;
    });
  }

  contarPorRol(rol: string): number {
    return this.usuarios.filter(u => u.rol === rol).length;
  }

  contarPorEstado(estado: string): number {
    return this.usuarios.filter(u => u.estado === estado).length;
  }

  resetearFiltros(): void {
    this.busquedaGlobal = '';
    this.rolFiltro = 'Todos';
    this.estadoFiltro = 'Todos';
    this.aplicarFiltros();
  }

  abrirModalCrearUsuario(): void {
    this.router.navigate(['/admin/usuarios/nuevo']);
  }

  editarUsuario(u: UsuarioSistema): void {
    this.router.navigate(['/admin/usuarios/roles', u.id]);
  }

  bloquearDesbloquear(u: UsuarioSistema): void {
    const nuevoEstado = u.estado !== 'Activo';
    const idRol = u.rol === 'Administrador' ? 1 : (u.rol === 'Médico' ? 2 : 3);

    this.usuarioService.actualizar(u.id, {
      nombreUsuario: u.username,
      estado: nuevoEstado,
      idRol: idRol
    }).subscribe({
      next: () => {
        u.estado = nuevoEstado ? 'Activo' : 'Bloqueado';
        this.aplicarFiltros();
        this.notify.info(`Cuenta de @${u.username} ahora está: ${u.estado}`);
      },
      error: (err) => {
        console.error('Error al cambiar estado del usuario:', err);
        this.notify.error(err?.error?.message || 'No se pudo cambiar el estado del usuario.');
      }
    });
  }

  async eliminarUsuario(u: UsuarioSistema): Promise<void> {
    const confirmado = await this.confirmModal.confirm({
      titulo: '¿Eliminar Usuario?',
      mensaje: `¿Confirma eliminar definitivamente la cuenta de acceso @${u.username}?`,
      textoConfirmar: 'Eliminar Cuenta',
      tipo: 'danger'
    });

    if (!confirmado) return;

    this.usuarioService.eliminar(u.id).subscribe({
      next: () => {
        this.notify.success(`Usuario @${u.username} eliminado correctamente.`);
        this.cargarDatos();
      },
      error: (err) => {
        console.error('Error al eliminar usuario:', err);
        this.notify.error(err?.error?.message || 'No se pudo eliminar el usuario.');
      }
    });
  }

}
