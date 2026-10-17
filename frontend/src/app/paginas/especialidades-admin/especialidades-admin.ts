import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './especialidades-admin.html',
  styleUrl: './especialidades-admin.css'
})
export class EspecialidadesAdminComponent {
  terminoGlobal: string = '';
  filtroNombre: string = '';
  filtroDepto: string = 'Todos';
  filtroEstado: string = 'Todas';

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

  listaFiltrada: EspecialidadRow[] = [...this.especialidades];

  aplicarFiltros() {
    this.listaFiltrada = this.especialidades.filter(item => {
      const matchNombre = item.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());
      const matchDepto = this.filtroDepto === 'Todos' || item.departamento === this.filtroDepto;
      const matchEstado = this.filtroEstado === 'Todas' || item.estado === this.filtroEstado;
      return matchNombre && matchDepto && matchEstado;
    });
  }

  resetearFiltros() {
    this.filtroNombre = '';
    this.filtroDepto = 'Todos';
    this.filtroEstado = 'Todas';
    this.listaFiltrada = [...this.especialidades];
  }

  abrirModalNueva() {
    console.log('Abrir modal para crear nueva especialidad');
  }

  editarEspecialidad(item: EspecialidadRow) {
    console.log('Editar:', item);
  }

  verDetalle(item: EspecialidadRow) {
    console.log('Ver detalle:', item);
  }
}