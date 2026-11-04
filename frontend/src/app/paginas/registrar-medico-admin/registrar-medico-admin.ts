import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MedicoService } from '../../services/medico.service';
import { EspecialidadService } from '../../services/especialidad.service';
import { UsuarioService } from '../../services/usuario.service';
import { NotificationService } from '../../services/notification.service';
import { Especialidad, MedicoRequest, UsuarioRequest } from '../../models';

@Component({
  selector: 'app-registrar-medico-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registrar-medico-admin.html',
  styleUrl: './registrar-medico-admin.css'
})
export class RegistrarMedicoAdminComponent implements OnInit {
  private readonly medicoService = inject(MedicoService);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  readonly especialidades = signal<Especialidad[]>([]);
  readonly cargandoEspecialidades = signal<boolean>(false);
  readonly guardando = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly idRolMedico = signal<number | null>(null);

  medicoForm = {
    nombre: '',
    apellido: '',
    matricula: '',
    telefono: '',
    idEspecialidad: null as number | null,
    crearCuentaUsuario: true,
    nombreUsuario: '',
    contrasena: '',
    confirmarContrasena: ''
  };

  ngOnInit(): void {
    this.cargarEspecialidades();
    this.cargarRolMedico();
  }

  cargarEspecialidades(): void {
    this.cargandoEspecialidades.set(true);
    this.especialidadService.listar().subscribe({
      next: (data) => {
        this.especialidades.set(data);
        this.cargandoEspecialidades.set(false);
        if (data.length > 0) {
          this.medicoForm.idEspecialidad = data[0].idEspecialidad;
        }
      },
      error: (err) => {
        this.cargandoEspecialidades.set(false);
        console.error('Error al cargar especialidades:', err);
      }
    });
  }

  cargarRolMedico(): void {
    this.usuarioService.listarRoles().subscribe({
      next: (roles) => {
        const rolEncontrado = roles.find(r => r.nombre.toUpperCase() === 'MEDICO');
        if (rolEncontrado) {
          this.idRolMedico.set(rolEncontrado.idRol);
        }
      },
      error: (err) => console.error('Error al cargar roles del sistema:', err)
    });
  }

  autoGenerarUsuario(): void {
    if (!this.medicoForm.nombreUsuario.trim()) {
      const nom = this.medicoForm.nombre.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const ape = this.medicoForm.apellido.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (ape) {
        this.medicoForm.nombreUsuario = nom ? `dr.${ape}` : ape;
      }
    }
  }

  guardarMedico(): void {
    this.errorMessage.set('');

    if (!this.medicoForm.nombre.trim() ||
      !this.medicoForm.apellido.trim() ||
      !this.medicoForm.matricula.trim() ||
      !this.medicoForm.telefono.trim() ||
      !this.medicoForm.idEspecialidad) {
      this.errorMessage.set('Por favor, complete todos los campos obligatorios del médico.');
      this.notify.warning('Complete todos los campos obligatorios antes de continuar.');
      return;
    }

    if (this.medicoForm.crearCuentaUsuario) {
      const username = this.medicoForm.nombreUsuario.trim();
      const pass = this.medicoForm.contrasena;
      const passConf = this.medicoForm.confirmarContrasena;

      if (!username) {
        this.errorMessage.set('Debe ingresar un nombre de usuario para la cuenta del médico.');
        this.notify.warning('Ingrese un nombre de usuario.');
        return;
      }

      if (username.length < 3) {
        this.errorMessage.set('El nombre de usuario debe tener al menos 3 caracteres.');
        this.notify.warning('Nombre de usuario demasiado corto.');
        return;
      }

      if (!pass || pass.length < 6) {
        this.errorMessage.set('La contraseña debe tener al menos 6 caracteres.');
        this.notify.warning('La contraseña debe tener mínimo 6 caracteres.');
        return;
      }

      if (pass !== passConf) {
        this.errorMessage.set('Las contraseñas no coinciden. Por favor, verifíquelas.');
        this.notify.error('Las contraseñas no coinciden.');
        return;
      }
    }

    this.guardando.set(true);

    if (this.medicoForm.crearCuentaUsuario) {
      const rolId = this.idRolMedico() || 2;
      const userPayload: UsuarioRequest = {
        nombreUsuario: this.medicoForm.nombreUsuario.trim(),
        contrasena: this.medicoForm.contrasena,
        idRol: rolId,
        activo: true
      };

      this.usuarioService.crear(userPayload).subscribe({
        next: (usuarioCreado) => {
          const medicoPayload: MedicoRequest = {
            nombre: this.medicoForm.nombre.trim(),
            apellido: this.medicoForm.apellido.trim(),
            matricula: this.medicoForm.matricula.trim(),
            telefono: this.medicoForm.telefono.trim(),
            idEspecialidad: this.medicoForm.idEspecialidad!,
            idUsuario: usuarioCreado.idUsuario
          };

          this.medicoService.crear(medicoPayload).subscribe({
            next: () => {
              this.guardando.set(false);
              this.notify.success(`¡Médico y cuenta de usuario (${usuarioCreado.nombreUsuario}) creados con éxito!`);
              this.router.navigate(['/admin/medicos']);
            },
            error: (errMed) => {
              this.usuarioService.eliminar(usuarioCreado.idUsuario).subscribe({
                error: (errDel) => console.error('Error en rollback de usuario:', errDel)
              });
              this.guardando.set(false);
              console.error('Error al registrar médico tras crear usuario:', errMed);
              if (errMed.status === 409) {
                this.errorMessage.set('Ya existe un médico registrado con esa misma matrícula profesional.');
              } else {
                this.errorMessage.set(errMed.error?.message || 'Error al guardar los datos del médico.');
              }
              this.notify.error(this.errorMessage());
            }
          });
        },
        error: (errUser) => {
          this.guardando.set(false);
          console.error('Error al crear usuario para médico:', errUser);
          if (errUser.status === 409) {
            this.errorMessage.set(`El nombre de usuario '${this.medicoForm.nombreUsuario}' ya se encuentra registrado.`);
          } else {
            this.errorMessage.set(errUser.error?.message || 'Error al crear la cuenta de usuario del médico.');
          }
          this.notify.error(this.errorMessage());
        }
      });
    } else {
      const medicoPayload: MedicoRequest = {
        nombre: this.medicoForm.nombre.trim(),
        apellido: this.medicoForm.apellido.trim(),
        matricula: this.medicoForm.matricula.trim(),
        telefono: this.medicoForm.telefono.trim(),
        idEspecialidad: this.medicoForm.idEspecialidad!
      };

      this.medicoService.crear(medicoPayload).subscribe({
        next: () => {
          this.guardando.set(false);
          this.notify.success('¡Profesional médico registrado con éxito en el sistema!');
          this.router.navigate(['/admin/medicos']);
        },
        error: (err) => {
          this.guardando.set(false);
          console.error('Error al registrar médico:', err);
          if (err.status === 409) {
            this.errorMessage.set('Ya existe un médico registrado con esa misma matrícula profesional.');
          } else {
            this.errorMessage.set(err.error?.message || 'Error al guardar el profesional. Intente nuevamente.');
          }
          this.notify.error(this.errorMessage());
        }
      });
    }
  }
}
