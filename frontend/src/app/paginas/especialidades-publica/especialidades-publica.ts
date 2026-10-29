import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EspecialidadService } from '../../services';
import { Especialidad } from '../../models';

interface EspecialidadItem {
  id: number;
  nombre: string;
  descripcion: string;
  atencion24hs: boolean;
  icono: string;
  colorClase: string;
  etiquetas: string[];
}

@Component({
  selector: 'app-especialidades-publica',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './especialidades-publica.html',
  styleUrl: './especialidades-publica.css'
})
export class EspecialidadesPublicaComponent implements OnInit {

  busqueda: string = '';
  cargando: boolean = false;

  especialidades: EspecialidadItem[] = [];
  especialidadesFiltradas: EspecialidadItem[] = [];

  constructor(private especialidadService: EspecialidadService) {}

  ngOnInit(): void {
    this.cargarEspecialidades();
  }

  cargarEspecialidades(): void {
    this.cargando = true;
    this.especialidadService.listar().subscribe({
      next: (data: Especialidad[]) => {
        this.especialidades = data.map(esp => this.mapearEspecialidad(esp));
        this.filtrar();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al listar especialidades públicas:', err);
        this.cargando = false;
      }
    });
  }

  private mapearEspecialidad(esp: Especialidad): EspecialidadItem {
    const id = esp.idEspecialidad;
    const nombre = esp.nombre;
    const n = nombre.toLowerCase();

    let icono = '🩺';
    let colorClase = 'icon-blue';
    let atencion24hs = false;
    let tags = ['Consultorios', 'Turnos Online'];

    if (n.includes('cardio')) {
      icono = '💙';
      colorClase = 'icon-blue';
      tags = ['Holter', 'Ergometría', 'Ecocardiograma'];
    } else if (n.includes('pediat') || n.includes('infan') || n.includes('neonat')) {
      icono = '🍼';
      colorClase = 'icon-cyan';
      atencion24hs = true;
      tags = ['Guardia 24hs', 'Controles', 'Vacunación'];
    } else if (n.includes('trauma') || n.includes('ortop')) {
      icono = '🦴';
      colorClase = 'icon-green';
      atencion24hs = true;
      tags = ['Guardia Activa', 'Yesos', 'Rehabilitación'];
    } else if (n.includes('neuro')) {
      icono = '🧠';
      colorClase = 'icon-purple';
      tags = ['EEG', 'Mapeo', 'Cefaleas'];
    } else if (n.includes('ginec') || n.includes('obstet')) {
      icono = '🤰';
      colorClase = 'icon-blue';
      tags = ['Obstetricia', 'Eco Doppler', 'Salud Femenina'];
    }

    return {
      id,
      nombre,
      descripcion: `Atención médica integral en ${nombre} con equipamiento moderno y profesionales de primer nivel.`,
      atencion24hs,
      icono,
      colorClase,
      etiquetas: tags
    };
  }

  filtrar(): void {
    const query = this.busqueda.toLowerCase().trim();
    if (!query) {
      this.especialidadesFiltradas = [...this.especialidades];
      return;
    }
    this.especialidadesFiltradas = this.especialidades.filter(esp => 
      esp.nombre.toLowerCase().includes(query) ||
      esp.etiquetas.some(t => t.toLowerCase().includes(query))
    );
  }

}
