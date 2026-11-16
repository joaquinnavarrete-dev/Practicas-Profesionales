import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UsuarioService, NotificationService, AuthService } from '../../services';
import { Usuario, Rol } from '../../models';
import { AdminTopbarComponent } from '../../componentes/admin-topbar/admin-topbar';

@Component({
  selector: 'app-editar-usuario-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminTopbarComponent],
  templateUrl: './editar-usuario-admin.html',
  styleUrl: './editar-usuario-admin.css'
})
export class EditarUsuarioAdminComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usuarioService = inject(UsuarioService);
  private readonly notify = inject(NotificationService);
  readonly authService = inject(AuthService);

  readonly usuarioId = signal<number | null>(null);
  readonly cargando = signal<boolean>(true);
  readonly guardando = signal<boolean>(false);
  readonly roles = signal<Rol[]>([]);

  usuarioForm = {
    username: '',
    idRol: 0,
    activo: true,
    nuevaPassword: '',
    confirmarPassword: ''
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const idNum = Number(id);

    if (!idNum) {
      this.notify.error('Identificador de usuario no válido.');
      this.router.navigate(['/admin/usuarios']);
      return;
    }

    this.usuarioId.set(idNum);
    this.cargarDatos(idNum);
  }

  cargarDatos(id: number): void {
    this.cargando.set(true);

    this.usuarioService.listarRoles().subscribe({
      next: (rolesList) => {
        this.roles.set(rolesList);

        this.usuarioService.buscarPorId(id).subscribe({
          next: (u: Usuario) => {
            this.usuarioForm.username = u.nombreUsuario;
            this.usuarioForm.idRol = u.rol ? u.rol.idRol : (rolesList.length > 0 ? rolesList[0].idRol : 0);
            this.usuarioForm.activo = u.activo !== undefined ? u.activo : (u.estado !== undefined ? u.estado : true);
            this.cargando.set(false);
          },
          error: (err) => {
            this.cargando.set(false);
            console.error('Error al obtener usuario:', err);
            this.notify.error('No se pudo encontrar el usuario solicitado.');
            this.router.navigate(['/admin/usuarios']);
          }
        });
      },
      error: (err) => {
        this.cargando.set(false);
        console.error('Error al cargar roles:', err);
        this.notify.error('No se pudieron cargar los roles del sistema.');
      }
    });
  }

  guardarUsuario(): void {
    const id = this.usuarioId();
    if (!id) return;

    if (!this.usuarioForm.username.trim()) {
      this.notify.warning('El nombre de usuario es obligatorio.');
      return;
    }

    if (!this.usuarioForm.idRol) {
      this.notify.warning('Debe seleccionar un rol para el usuario.');
      return;
    }

    if (this.usuarioForm.nuevaPassword && this.usuarioForm.nuevaPassword !== this.usuarioForm.confirmarPassword) {
      this.notify.warning('Las contraseñas no coinciden.');
      return;
    }

    this.guardando.set(true);

    const payload: any = {
      nombreUsuario: this.usuarioForm.username.trim(),
      idRol: Number(this.usuarioForm.idRol),
      activo: this.usuarioForm.activo
    };

    if (this.usuarioForm.nuevaPassword) {
      payload.contrasena = this.usuarioForm.nuevaPassword;
    }

    this.usuarioService.actualizar(id, payload).subscribe({
      next: (actualizado) => {
        this.guardando.set(false);
        this.notify.success(`Usuario @${actualizado.nombreUsuario} actualizado correctamente.`);
        this.router.navigate(['/admin/usuarios']);
      },
      error: (err) => {
        this.guardando.set(false);
        console.error('Error al actualizar usuario:', err);
        this.notify.error(err?.error?.message || 'Error al actualizar el usuario en el servidor.');
      }
    });
  }
}
