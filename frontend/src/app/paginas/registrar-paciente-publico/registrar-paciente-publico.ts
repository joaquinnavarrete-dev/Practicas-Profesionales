import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PacienteService } from '../../services/paciente.service';
import { ObraSocialService } from '../../services/obra-social.service'; // Revisá si tu archivo se llama así o está en otra carpeta

@Component({
  selector: 'app-registrar-paciente-publico',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registrar-paciente-publico.html',
  styleUrl: './registrar-paciente-publico.css'
})
export class RegistrarPacientePublicoComponent implements OnInit {

  pacienteForm = {
    nombre: '',
    apellido: '',
    dni: '',
    fechaNacimiento: '',
    genero: 'Masculino',
    telefono: '',
    email: '',
    password: '',
    confirmPassword: '',
    domicilio: '',
    idObraSocial: null as number | null,
    planAfiliado: ''
  };

  obrasSociales: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private pacienteService: PacienteService,
    private obraSocialService: ObraSocialService
  ) {}

  ngOnInit(): void {
    this.cargarObrasSociales();
  }

  cargarObrasSociales(): void {
    this.obraSocialService.listarObrasSociales().subscribe({
      next: (data: any[]) => {
        this.obrasSociales = data;
      },
      error: (err: any) => {
        console.error('Error al cargar las obras sociales:', err);
        this.errorMessage = 'No se pudieron cargar las obras sociales disponibles.';
      }
    });
  }

registrarUsuarioPublico(): void {
    if (this.pacienteForm.password !== this.pacienteForm.confirmPassword) {
      this.errorMessage = 'Las contraseñas ingresadas no coinciden.';
      return;
    }

    if (!this.pacienteForm.idObraSocial) {
      this.errorMessage = 'Por favor, selecciona una obra social válida.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    
    // Es este objeto que armás antes de hacer el subscribe:
    const payload = {
      dni: this.pacienteForm.dni,
      nombre: this.pacienteForm.nombre,
      apellido: this.pacienteForm.apellido,
      telefono: this.pacienteForm.telefono,
      email: this.pacienteForm.email,         
      password: this.pacienteForm.password,     
      idObraSocial: Number(this.pacienteForm.idObraSocial)
    };

    this.pacienteService.registrarPaciente(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        alert('¡Registro exitoso! Ya puede iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error en el registro:', err);
        this.errorMessage = err.error?.message || 'Ocurrió un error al registrarse.';
      }
    });
  }
}