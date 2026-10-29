import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MedicoService } from '../../services/medico.service';
import { EspecialidadService } from '../../services/especialidad.service';
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
  private readonly router = inject(Router);

  especialidades: Especialidad[] = [];
  cargandoEspecialidades: boolean = false;
  guardando: boolean = false;
  errorMessage: string = '';

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
    this.cargandoEspecialidades = true;
    this.especialidadService.listar().subscribe({
      next: (data) => {
        this.especialidades = data;
        this.cargandoEspecialidades = false;
        if (data.length > 0) {
          this.medicoForm.idEspecialidad = data[0].idEspecialidad;
        }
      },
      error: (err) => {
        this.cargandoEspecialidades = false;
        console.error('Error al cargar especialidades:', err);
      }
    });
  }

  guardarMedico(): void {
    this.errorMessage = '';

    if (!this.medicoForm.nombre.trim() ||
        !this.medicoForm.apellido.trim() ||
        !this.medicoForm.matricula.trim() ||
        !this.medicoForm.telefono.trim() ||
        !this.medicoForm.idEspecialidad) {
      this.errorMessage = 'Por favor, complete todos los campos obligatorios.';
      return;
    }

    this.guardando = true;

    const payload: MedicoRequest = {
      nombre: this.medicoForm.nombre.trim(),
      apellido: this.medicoForm.apellido.trim(),
      matricula: this.medicoForm.matricula.trim(),
      telefono: this.medicoForm.telefono.trim(),
      idEspecialidad: this.medicoForm.idEspecialidad
    };

    this.medicoService.crear(payload).subscribe({
      next: () => {
        this.guardando = false;
        alert('¡Profesional médico registrado con éxito!');
        this.router.navigate(['/admin/medicos']);
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error al registrar médico:', err);
        if (err.status === 409) {
          this.errorMessage = 'Ya existe un médico registrado con esa misma matrícula profesional.';
        } else {
          this.errorMessage = err.error?.message || 'Error al guardar el profesional. Intente nuevamente.';
        }
      }
    });
  }
}
