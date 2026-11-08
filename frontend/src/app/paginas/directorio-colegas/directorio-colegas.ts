import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicoService, DiaAtencionService, AuthService } from '../../services';
import { Medico, DiaAtencion, ColegaMedicoCard } from '../../models';
import { AdminTopbarComponent } from '../../componentes/admin-topbar/admin-topbar';

@Component({
  selector: 'app-directorio-colegas',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminTopbarComponent],
  templateUrl: './directorio-colegas.html',
  styleUrl: './directorio-colegas.css'
})
export class DirectorioColegasComponent implements OnInit {
  private readonly medicoService = inject(MedicoService);
  private readonly diaAtencionService = inject(DiaAtencionService);
  readonly authService = inject(AuthService);

  readonly cargando = signal<boolean>(false);
  readonly busqueda = signal<string>('');
  readonly colegas = signal<ColegaMedicoCard[]>([]);

  readonly colegasFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const lista = this.colegas();
    if (!q) return lista;

    return lista.filter(c =>
      c.nombreCompleto.toLowerCase().includes(q) ||
      c.especialidad.toLowerCase().includes(q) ||
      c.matricula.toLowerCase().includes(q) ||
      c.consultorio.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);

    this.medicoService.listar().subscribe({
      next: (medicos: Medico[]) => {
        this.diaAtencionService.listar().subscribe({
          next: (dias: DiaAtencion[]) => {
            const diasMap: { [idMed: number]: string[] } = {};
            const nombresDias = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

            dias.forEach(d => {
              const num = Number(d.diaSemana);
              const nombre = nombresDias[num] || d.diaSemana;
              if (!diasMap[d.idMedico]) {
                diasMap[d.idMedico] = [];
              }
              if (!diasMap[d.idMedico].includes(nombre)) {
                diasMap[d.idMedico].push(nombre);
              }
            });

            const cards: ColegaMedicoCard[] = medicos.map(m => ({
              idMedico: m.idMedico,
              nombreCompleto: `Dr(a). ${m.nombre} ${m.apellido}`,
              especialidad: m.especialidad?.nombre || 'Medicina General',
              matricula: m.matricula || 'M.N. Registrada',
              telefono: m.telefono || 'Sin teléfono informado',
              consultorio: `Consultorio ${100 + m.idMedico}`,
              diasAtencion: diasMap[m.idMedico] || ['A convenir']
            }));

            this.colegas.set(cards);
            this.cargando.set(false);
          },
          error: (err) => {
            console.error('Error al cargar días de atención:', err);
            this.cargando.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error al listar colegas:', err);
        this.cargando.set(false);
      }
    });
  }
}

