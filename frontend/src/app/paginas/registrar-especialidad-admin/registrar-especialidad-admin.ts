import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EspecialidadService } from '../../services';

@Component({
  selector: 'app-registrar-especialidad-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registrar-especialidad-admin.html',
  styleUrl: './registrar-especialidad-admin.css'
})
export class RegistrarEspecialidadAdminComponent {

  guardando: boolean = false;

  especialidadForm = {
    nombre: '',
    codigo: '',
    descripcion: '',
    duracionTurno: '30',
    estado: 'Activa'
  };

  constructor(
    private router: Router,
    private especialidadService: EspecialidadService
  ) { }

  guardarEspecialidad(): void {
    if (!this.especialidadForm.nombre.trim()) {
      alert('Por favor, ingrese el nombre de la especialidad.');
      return;
    }

    this.guardando = true;
    this.especialidadService.crear({
      nombre: this.especialidadForm.nombre.trim()
    }).subscribe({
      next: (nuevaEsp) => {
        this.guardando = false;
        alert(`¡Especialidad médica "${nuevaEsp.nombre}" registrada con éxito!`);
        this.router.navigate(['/admin/especialidades']);
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error al registrar especialidad en Spring Boot:', err);
        alert(err?.error?.message || 'Error al conectar con el servidor para registrar la especialidad.');
      }
    });
  }

}
