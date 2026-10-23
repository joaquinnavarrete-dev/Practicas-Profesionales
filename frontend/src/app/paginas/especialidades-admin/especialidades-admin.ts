import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

interface EspecialidadRow {
  id: number;
  nombre: string;
  departamento: string;
  duracion: number;
  medicos: number;
  estado: string;
  icono: string;
  bgClase: string;
}

@Component({
  selector: 'app-especialidades-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './especialidades-admin.html',
  styleUrl: './especialidades-admin.css'
})
export class EspecialidadesAdminComponent {
  
  // Variables de filtrado en pantalla
  terminoGlobal: string = '';
  filtroNombre: string = '';
  filtroDepto: string = 'Todos';
  filtroEstado: string = 'Todas';

  // Padrón mock de especialidades médicas
  especialidades: EspecialidadRow[] = [
    {
      id: 1,
      nombre: 'Cardiología Infantil',
      departamento: 'Cardiología',
      duracion: 30,
      medicos: 4,
      estado: 'Activa',
      icono: '🫀',
      bgClase: 'bg-blue-soft'
    },
    {
      id: 2,
      nombre: 'Cardiología Clínica',
      departamento: 'Cardiología',
      duracion: 30,
      medicos: 6,
      estado: 'Activa',
      icono: '💙',
      bgClase: 'bg-cyan-soft'
    },
    {
      id: 3,
      nombre: 'Pediatría Integral',
      departamento: 'Materno Infantil',
      duracion: 20,
      medicos: 12,
      estado: 'Activa',
      icono: '🍼',
      bgClase: 'bg-blue-soft'
    },
    {
      id: 4,
      nombre: 'Traumatología y Ortopedia',
      departamento: 'Cirugía',
      duracion: 30,
      medicos: 7,
      estado: 'Activa',
      icono: '🦴',
      bgClase: 'bg-cyan-soft'
    },
    {
      id: 5,
      nombre: 'Neurología',
      departamento: 'Neurociencias',
      duracion: 45,
      medicos: 3,
      estado: 'Activa',
      icono: '🧠',
      bgClase: 'bg-purple-soft'
    },
    {
      id: 6,
      nombre: 'Ginecología y Obstetricia',
      departamento: 'Salud Femenina',
      duracion: 30,
      medicos: 5,
      estado: 'Activa',
      icono: '🤰',
      bgClase: 'bg-blue-soft'
    }
  ];

  // 1️⃣ PRIMERO declaramos e inicializamos la lista filtrada antes del constructor
  listaFiltrada: EspecialidadRow[] = [...this.especialidades];

  // 2️⃣ DESPUÉS va el constructor que ya puede usar sin problema las variables de arriba
  constructor(private router: Router) {
    this.aplicarFiltros();
  }

  /**
   * Filtra las especialidades según los criterios seleccionados.
   */
  aplicarFiltros(): void {
    this.listaFiltrada = this.especialidades.filter(item => {
      const matchNombre = item.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());
      const matchDepto = this.filtroDepto === 'Todos' || item.departamento === this.filtroDepto;
      const matchEstado = this.filtroEstado === 'Todas' || item.estado === this.filtroEstado;
      return matchNombre && matchDepto && matchEstado;
    });
  }

  /**
   * Resetea los filtros a su estado inicial.
   */
  resetearFiltros(): void {
    this.filtroNombre = '';
    this.filtroDepto = 'Todos';
    this.filtroEstado = 'Todas';
    this.listaFiltrada = [...this.especialidades];
  }

  /**
   * Redirige al formulario de alta de una nueva especialidad médica.
   */
  abrirModalNueva(): void {
    this.router.navigate(['/admin/especialidades/nuevo']);
  }

  /**
   * Redirige a la pantalla de edición pasando el ID de la especialidad seleccionada.
   */
  editarEspecialidad(e: EspecialidadRow): void {
    this.router.navigate(['/admin/especialidades/editar', e.id]);
  }

  /**
   * Muestra el detalle del ítem seleccionado en consola.
   */
  verDetalle(item: EspecialidadRow): void {
    console.log('Ver detalle:', item);
  }

}