import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ObraSocialService } from '../../services/obra-social.service';
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
  private readonly router = inject(Router);

  obrasSociales: ObraSocial[] = [];
  cargandoObrasSociales: boolean = true;
  cargandoRegistro: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

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
    this.cargandoObrasSociales = true;
    this.obraSocialService.listar().subscribe({
      next: (data) => {
        this.obrasSociales = data;
        this.cargandoObrasSociales = false;

        const particular = data.find(os => os.nombre.toLowerCase().includes('particular'));
        if (particular) {
          this.pacienteForm.idObraSocial = particular.idObraSocial;
        } else if (data.length > 0) {
          this.pacienteForm.idObraSocial = data[0].idObraSocial;
        }
      },
      error: (err) => {
        this.cargandoObrasSociales = false;
        console.error('Error al cargar obras sociales:', err);
      }
    });
  }

  registrarUsuarioPublico(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.pacienteForm.nombre.trim() ||
      !this.pacienteForm.apellido.trim() ||
      !this.pacienteForm.dni.trim() ||
      !this.pacienteForm.telefono.trim() ||
      !this.pacienteForm.nombreUsuario.trim() ||
      !this.pacienteForm.idObraSocial) {
      this.errorMessage = 'Por favor, complete todos los campos obligatorios marcados con (*).';
      return;
    }

    if (this.pacienteForm.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener un mínimo de 6 caracteres.';
      return;
    }

    if (this.pacienteForm.password !== this.pacienteForm.confirmPassword) {
      this.errorMessage = 'Las contraseñas ingresadas no coinciden. Por favor, verifíquelas.';
      return;
    }

    this.cargandoRegistro = true;

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
        this.cargandoRegistro = false;
        this.successMessage = '¡Registro exitoso! Tu cuenta ha sido creada e iniciaste sesión.';

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      },
      error: (err) => {
        this.cargandoRegistro = false;
        console.error('Error en auto-registro:', err);
        if (err.status === 409) {
          this.errorMessage = err.error?.message || 'Ya existe un paciente con el mismo DNI o un usuario con ese nombre de usuario.';
        } else if (err.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.';
        } else {
          this.errorMessage = err.error?.message || 'Ocurrió un error al procesar el registro. Intente nuevamente.';
        }
      }
    });
  }
}
