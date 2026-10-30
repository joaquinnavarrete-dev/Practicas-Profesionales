import { Component, OnInit, signal, computed, inject } from '@angular/core';
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
  private readonly especialidadService = inject(EspecialidadService);

  readonly busqueda = signal<string>('');
  readonly cargando = signal<boolean>(false);
  readonly especialidades = signal<EspecialidadItem[]>([]);

  readonly especialidadesFiltradas = computed(() => {
    const query = this.busqueda().toLowerCase().trim();
    if (!query) {
      return this.especialidades();
    }
    return this.especialidades().filter(esp =>
      esp.nombre.toLowerCase().includes(query) ||
      esp.etiquetas.some(t => t.toLowerCase().includes(query))
    );
  });

  ngOnInit(): void {
    this.cargarEspecialidades();
  }

  cargarEspecialidades(): void {
    this.cargando.set(true);
    this.especialidadService.listar().subscribe({
      next: (data: Especialidad[]) => {
        this.especialidades.set(data.map(esp => this.mapearEspecialidad(esp)));
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al listar especialidades públicas:', err);
        this.cargando.set(false);
      }
    });
  }

  actualizarBusqueda(valor: string): void {
    this.busqueda.set(valor);
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

  filtrar(valor?: string): void {
    if (typeof valor === 'string') {
      this.busqueda.set(valor);
    }
  }

}
