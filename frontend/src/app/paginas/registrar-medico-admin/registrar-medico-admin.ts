import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MedicoService } from '../../services/medico.service';
import { EspecialidadService } from '../../services/especialidad.service';
import { NotificationService } from '../../services/notification.service';
import { Especialidad, MedicoRequest } from '../../models';

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
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  readonly especialidades = signal<Especialidad[]>([]);
  readonly cargandoEspecialidades = signal<boolean>(false);
  readonly guardando = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  medicoForm = {
    nombre: '',
    apellido: '',
    matricula: '',
    telefono: '',
    idEspecialidad: null as number | null
  };

  ngOnInit(): void {
    this.cargarEspecialidades();
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

  guardarMedico(): void {
    this.errorMessage.set('');

    if (!this.medicoForm.nombre.trim() ||
        !this.medicoForm.apellido.trim() ||
        !this.medicoForm.matricula.trim() ||
        !this.medicoForm.telefono.trim() ||
        !this.medicoForm.idEspecialidad) {
      this.errorMessage.set('Por favor, complete todos los campos obligatorios.');
      this.notify.warning('Complete todos los campos obligatorios antes de continuar.');
      return;
    }

    this.guardando.set(true);

    const payload: MedicoRequest = {
      nombre: this.medicoForm.nombre.trim(),
      apellido: this.medicoForm.apellido.trim(),
      matricula: this.medicoForm.matricula.trim(),
      telefono: this.medicoForm.telefono.trim(),
      idEspecialidad: this.medicoForm.idEspecialidad
    };

    this.medicoService.crear(payload).subscribe({
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
