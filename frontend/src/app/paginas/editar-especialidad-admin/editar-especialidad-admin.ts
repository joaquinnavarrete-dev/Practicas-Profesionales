import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EspecialidadService, NotificationService } from '../../services';
import { Especialidad } from '../../models';

@Component({
  selector: 'app-editar-especialidad-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './editar-especialidad-admin.html',
  styleUrl: './editar-especialidad-admin.css'
})
export class EditarEspecialidadAdminComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly notify = inject(NotificationService);

  especialidadId: string | null = null;
  cargando: boolean = false;
  guardando: boolean = false;

  especialidadForm = {
    nombre: '',
    codigo: '',
    descripcion: '',
    duracionTurno: '30',
    estado: 'Activa'
  };

  ngOnInit(): void {
    this.especialidadId = this.route.snapshot.paramMap.get('id');

    if (this.especialidadId) {
      const idNum = Number(this.especialidadId);
      this.cargando = true;
      this.especialidadService.buscarPorId(idNum).subscribe({
        next: (esp: Especialidad) => {
          this.cargando = false;
          this.especialidadForm = {
            nombre: esp.nombre,
            codigo: `ESP-${esp.idEspecialidad}`,
            descripcion: `Servicio de ${esp.nombre}`,
            duracionTurno: '30',
            estado: 'Activa'
          };
        },
        error: (err: any) => {
          this.cargando = false;
          console.error('Error al obtener especialidad de Spring Boot:', err);
          this.notify.error('No se pudo encontrar la especialidad solicitada.');
          this.router.navigate(['/admin/especialidades']);
        }
      });
    }
  }

  actualizarEspecialidad(): void {
    if (!this.especialidadForm.nombre.trim()) {
      this.notify.warning('Por favor, ingrese el nombre de la especialidad.');
      return;
    }

    if (!this.especialidadId) return;

    this.guardando = true;
    const idNum = Number(this.especialidadId);

    this.especialidadService.actualizar(idNum, {
      nombre: this.especialidadForm.nombre.trim()
    }).subscribe({
      next: (espActualizada: Especialidad) => {
        this.guardando = false;
        this.notify.success(`¡Especialidad "${espActualizada.nombre}" actualizada con éxito!`);
        this.router.navigate(['/admin/especialidades']);
      },
      error: (err: any) => {
        this.guardando = false;
        console.error('Error al actualizar especialidad:', err);
        this.notify.error(err?.error?.message || 'Error al comunicarse con el servidor para actualizar la especialidad.');
      }
    });
  }

}
