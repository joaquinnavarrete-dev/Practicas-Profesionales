import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './especialidades-publica.html',
  styleUrl: './especialidades-publica.css'
})
export class EspecialidadesPublicaComponent {
  busqueda: string = '';

  especialidades: EspecialidadItem[] = [
    {
      id: 1,
      nombre: 'Cardiología',
      descripcion: 'Prevención, diagnóstico y tratamiento de patologías cardíacas y vasculares con aparatología de última generación.',
      atencion24hs: false,
      icono: '💙',
      colorClase: 'icon-blue',
      etiquetas: ['Holter', 'Ergometría', 'Ecocardiograma']
    },
    {
      id: 2,
      nombre: 'Pediatría y Neonatología',
      descripcion: 'Atención integral del niño y adolescente. Guardia pediátrica presencial permanente y seguimiento de desarrollo.',
      atencion24hs: true,
      icono: '🍼',
      colorClase: 'icon-cyan',
      etiquetas: ['Guardia 24hs', 'Controles', 'Vacunación']
    },
    {
      id: 3,
      nombre: 'Traumatología y Ortopedia',
      descripcion: 'Tratamiento de lesiones óseas, articulares y ligamentarias. Cirugías artroscópicas y rehabilitación integral.',
      atencion24hs: true,
      icono: '🦴',
      colorClase: 'icon-green',
      etiquetas: ['Columna', 'Yesos', 'Guardia Activa']
    },
    {
      id: 4,
      nombre: 'Neurología',
      descripcion: 'Estudio de trastornos del sistema nervioso central y periférico, cefaleas, migrañas y estudios electroencefalográficos.',
      atencion24hs: false,
      icono: '🧠',
      colorClase: 'icon-purple',
      etiquetas: ['EEG', 'Mapeo Cerebral', 'Cefaleas']
    },
    {
      id: 5,
      nombre: 'Ginecología y Obstetricia',
      descripcion: 'Cuidado de la salud femenina, seguimiento del embarazo, estudios ecográficos de alta resolución y controles preventivos.',
      atencion24hs: false,
      icono: '🤰',
      colorClase: 'icon-blue',
      etiquetas: ['Eco 5D', 'Papanicolau', 'Obstetricia']
    },
    {
      id: 6,
      nombre: 'Diagnóstico por Imágenes',
      descripcion: 'Servicio digital de resonancia magnética, tomografía computada multicorte, radiología y ecografía general.',
      atencion24hs: true,
      icono: '📷',
      colorClase: 'icon-cyan',
      etiquetas: ['Resonador 3.0T', 'Tomografía', 'Rayos X']
    }
  ];

  especialidadesFiltradas: EspecialidadItem[] = [...this.especialidades];

  filtrar() {
    const query = this.busqueda.toLowerCase().trim();
    this.especialidadesFiltradas = this.especialidades.filter(esp => 
      esp.nombre.toLowerCase().includes(query) ||
      esp.descripcion.toLowerCase().includes(query) ||
      esp.etiquetas.some(t => t.toLowerCase().includes(query))
    );
  }
}