import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MedicoService } from '../../services/medico.service';
import { EspecialidadService } from '../../services/especialidad.service';
import { NotificationService } from '../../services/notification.service';
import { Especialidad, MedicoRequest } from '../../models';

@Component({
  selector: 'app-editar-medico-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './editar-medico-admin.html',
  styleUrl: './editar-medico-admin.css'
})
export class EditarMedicoAdminComponent implements OnInit {
  private readonly medicoService = inject(MedicoService);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly medicoId = signal<number | null>(null);
  readonly especialidades = signal<Especialidad[]>([]);
  readonly cargando = signal<boolean>(true);
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
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/admin/medicos']);
      return;
    }

    this.medicoId.set(Number(idParam));
    this.cargarDatos();
  }

  cargarDatos(): void {
    const id = this.medicoId();
    if (!id) return;

    this.cargando.set(true);

    this.especialidadService.listar().subscribe({
      next: (esps) => {
        this.especialidades.set(esps);

        this.medicoService.buscarPorId(id).subscribe({
          next: (med) => {
            this.medicoForm = {
              nombre: med.nombre,
              apellido: med.apellido,
              matricula: med.matricula,
              telefono: med.telefono,
              idEspecialidad: med.especialidad.idEspecialidad
            };
            this.cargando.set(false);
          },
          error: (err) => {
            this.cargando.set(false);
            console.error('Error al cargar datos del médico:', err);
            this.errorMessage.set('No se encontró el profesional médico solicitado.');
            this.notify.error('No se encontró el profesional médico solicitado.');
          }
        });
      },
      error: (err) => {
        this.cargando.set(false);
        console.error('Error al cargar especialidades:', err);
      }
    });
  }

  guardarCambios(): void {
    const id = this.medicoId();
    if (!id) return;

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

    this.medicoService.actualizar(id, payload).subscribe({
      next: () => {
        this.guardando.set(false);
        this.notify.success('¡Datos del profesional médico actualizados con éxito!');
        this.router.navigate(['/admin/medicos']);
      },
      error: (err) => {
        this.guardando.set(false);
        console.error('Error al actualizar médico:', err);
        if (err.status === 409) {
          this.errorMessage.set('Ya existe otro médico registrado con la misma matrícula.');
        } else {
          this.errorMessage.set(err.error?.message || 'Error al actualizar el profesional. Intente nuevamente.');
        }
        this.notify.error(this.errorMessage());
      }
    });
  }
}
