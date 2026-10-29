import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ObraSocialService } from '../../services';

@Component({
  selector: 'app-registrar-obra-social-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registrar-obra-social-admin.html',
  styleUrl: './registrar-obra-social-admin.css'
})
export class RegistrarObraSocialAdminComponent {

  guardando: boolean = false;

  obraSocialForm = {
    nombre: '',
    siglas: '',
    cuit: '',
    telefono: '',
    email: '',
    planesDisponibles: '',
    estado: 'Activa'
  };

  constructor(
    private router: Router,
    private obraSocialService: ObraSocialService
  ) { }

  guardarObraSocial(): void {
    if (!this.obraSocialForm.nombre.trim()) {
      alert('Por favor, ingrese el nombre de la obra social.');
      return;
    }

    this.guardando = true;
    this.obraSocialService.crear({
      nombre: this.obraSocialForm.nombre.trim()
    }).subscribe({
      next: (nuevaOS) => {
        this.guardando = false;
        alert(`¡Obra social "${nuevaOS.nombre}" registrada con éxito en el sistema!`);
        this.router.navigate(['/admin/obras-sociales']);
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error al registrar obra social:', err);
        alert(err?.error?.message || 'Error al comunicarse con el servidor para registrar la obra social.');
      }
    });
  }

}
