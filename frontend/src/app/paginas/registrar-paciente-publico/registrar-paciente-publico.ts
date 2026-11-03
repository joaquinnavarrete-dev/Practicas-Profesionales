import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ObraSocialService } from '../../services/obra-social.service';
import { NotificationService } from '../../services/notification.service';
import { ObraSocial, RegistroPacienteRequest } from '../../models';

@Component({
  selector: 'app-registrar-paciente-publico',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registrar-paciente-publico.html',
  styleUrl: './registrar-paciente-publico.css'
})
export class RegistrarPacientePublicoComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly obraSocialService = inject(ObraSocialService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  readonly obrasSociales = signal<ObraSocial[]>([]);
  readonly cargandoObrasSociales = signal<boolean>(true);
  readonly cargandoRegistro = signal<boolean>(false);
  readonly intentoEnvio = signal<boolean>(false);

  pacienteForm = {
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    idObraSocial: null as number | null,
    nombreUsuario: '',
    password: '',
    confirmPassword: '',

    fechaNacimiento: '',
    genero: 'Masculino',
    domicilio: '',
    planAfiliado: ''
  };

  ngOnInit(): void {
    this.cargarObrasSociales();
  }

  cargarObrasSociales(): void {
    this.cargandoObrasSociales.set(true);
    this.obraSocialService.listar().subscribe({
      next: (data) => {
        this.obrasSociales.set(data);
        this.cargandoObrasSociales.set(false);

        const particular = data.find(os => os.nombre.toLowerCase().includes('particular'));
        if (particular) {
          this.pacienteForm.idObraSocial = particular.idObraSocial;
        } else if (data.length > 0) {
          this.pacienteForm.idObraSocial = data[0].idObraSocial;
        }
      },
      error: (err) => {
        this.cargandoObrasSociales.set(false);
        console.error('Error al cargar obras sociales:', err);
      }
    });
  }

  campoInvalido(campo: string): boolean {
    if (!this.intentoEnvio()) return false;
    switch (campo) {
      case 'nombre':
        return !this.pacienteForm.nombre.trim();
      case 'apellido':
        return !this.pacienteForm.apellido.trim();
      case 'dni':
        return !this.pacienteForm.dni.trim();
      case 'telefono':
        return !this.pacienteForm.telefono.trim();
      case 'nombreUsuario':
        return !this.pacienteForm.nombreUsuario.trim();
      case 'password':
        return !this.pacienteForm.password || this.pacienteForm.password.length < 6;
      case 'confirmPassword':
        return !this.pacienteForm.confirmPassword || this.pacienteForm.password !== this.pacienteForm.confirmPassword;
      case 'idObraSocial':
        return !this.pacienteForm.idObraSocial;
      default:
        return false;
    }
  }

  registrarUsuarioPublico(): void {
    this.intentoEnvio.set(true);

    if (
      !this.pacienteForm.nombre.trim() ||
      !this.pacienteForm.apellido.trim() ||
      !this.pacienteForm.dni.trim() ||
      !this.pacienteForm.telefono.trim() ||
      !this.pacienteForm.nombreUsuario.trim() ||
      !this.pacienteForm.idObraSocial
    ) {
      this.notify.show('warning', 'Por favor, complete todos los campos obligatorios marcados con (*).', 'Campos Incompletos');
      return;
    }

    if (this.pacienteForm.password.length < 6) {
      this.notify.show('warning', 'La contraseña debe tener un mínimo de 6 caracteres.', 'Contraseña Inválida');
      return;
    }

    if (this.pacienteForm.password !== this.pacienteForm.confirmPassword) {
      this.notify.show('warning', 'Las contraseñas ingresadas no coinciden. Por favor, verifíquelas.', 'Contraseñas Diferentes');
      return;
    }

    this.cargandoRegistro.set(true);

    const payload: RegistroPacienteRequest = {
      dni: this.pacienteForm.dni.trim(),
      nombre: this.pacienteForm.nombre.trim(),
      apellido: this.pacienteForm.apellido.trim(),
      telefono: this.pacienteForm.telefono.trim(),
      idObraSocial: this.pacienteForm.idObraSocial,
      nombreUsuario: this.pacienteForm.nombreUsuario.trim(),
      contrasena: this.pacienteForm.password
    };

    this.authService.registroPaciente(payload).subscribe({
      next: () => {
        this.cargandoRegistro.set(false);
        this.notify.show('success', '¡Registro exitoso! Tu cuenta ha sido creada e iniciaste sesión.', '¡Bienvenido!');

        setTimeout(() => {
          this.router.navigate(['/mi-portal']);
        }, 1200);
      },
      error: (err) => {
        this.cargandoRegistro.set(false);
        console.error('Error en auto-registro:', err);
        if (err.status === 409) {
          const mensaje = err.error?.message || 'Ya existe un paciente con el mismo DNI o un usuario con ese nombre de usuario.';
          this.notify.show('error', mensaje, 'Datos Ya Registrados');
        } else if (err.status === 0) {
          this.notify.show('error', 'No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.', 'Error de Conexión');
        } else {
          const mensaje = err.error?.message || 'Ocurrió un error al procesar el registro. Intente nuevamente.';
          this.notify.show('error', mensaje, 'Error de Registro');
        }
      }
    });
  }
}
