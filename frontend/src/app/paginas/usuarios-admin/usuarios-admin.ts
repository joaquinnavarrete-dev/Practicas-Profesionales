import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

export interface UsuarioSistema {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  rol: 'Administrador' | 'Médico' | 'Recepción' | 'Paciente';
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
export class UsuariosAdminComponent {

  busquedaGlobal: string = '';
  rolFiltro: string = 'Todos';
  estadoFiltro: string = 'Todos';

  usuarios: UsuarioSistema[] = [
    {
      id: 1,
      username: 'mgomez',
      nombre: 'Mariana',
      apellido: 'Gómez',
      email: 'mariana.gomez@sangabriel.com',
      dni: '28.452.109',
      rol: 'Administrador',
      ultimoIngreso: 'Hoy, 08:12 hs',
      estado: 'Activo',
      avatarUrl: '👩‍⚕️'
    },
    {
      id: 2,
      username: 'jmartinez',
      nombre: 'Javier',
      apellido: 'Martínez',
      email: 'javier.martinez@sangabriel.com',
      dni: '30.128.940',
      rol: 'Médico',
      ultimoIngreso: 'Ayer, 18:30 hs',
      estado: 'Activo',
      avatarUrl: '👨‍⚕️'
    },
    {
      id: 3,
      username: 'lrodriguez',
      nombre: 'Laura',
      apellido: 'Rodríguez',
      email: 'laura.rodriguez@email.com',
      dni: '34.567.890',
      rol: 'Paciente',
      ultimoIngreso: '22 Oct 2025',
      estado: 'Activo',
      avatarUrl: '👩'
    }
  ];

  usuariosFiltrados: UsuarioSistema[] = [...this.usuarios];

  constructor(private router: Router) {
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    const q = this.busquedaGlobal.toLowerCase().trim();

    this.usuariosFiltrados = this.usuarios.filter(u => {
      const matchRol = this.rolFiltro === 'Todos' || u.rol === this.rolFiltro;
      const matchEstado = this.estadoFiltro === 'Todos' || u.estado === this.estadoFiltro;
      const nombreCompleto = `${u.nombre} ${u.apellido}`.toLowerCase();
      const matchQuery = nombreCompleto.includes(q) || u.username.toLowerCase().includes(q);

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

  // ➔ AQUÍ OCURRE LA MAGIA: Al hacer clic en el lápiz, navegamos pasando el ID del usuario
  editarUsuario(u: UsuarioSistema): void {
    this.router.navigate(['/admin/usuarios/roles', u.id]);
  }

  bloquearDesbloquear(u: UsuarioSistema): void {
    console.log('Cambiando estado de cuenta para:', u.username);
  }

}