import { Component, OnInit, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EspecialidadService, MedicoService, NotificationService, AuthService } from '../../services';
import { Especialidad, Medico } from '../../models';
import { AdminTopbarComponent } from '../../componentes/admin-topbar/admin-topbar';

@Component({
  selector: 'app-detalle-especialidad-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminTopbarComponent],
  templateUrl: './detalle-especialidad-admin.html',
  styleUrl: './detalle-especialidad-admin.css'
})
export class DetalleEspecialidadAdminComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly medicoService = inject(MedicoService);
  private readonly notify = inject(NotificationService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly authService = inject(AuthService);

  readonly especialidadId = signal<number | null>(null);
  readonly especialidad = signal<Especialidad | null>(null);
  readonly medicosAsignados = signal<Medico[]>([]);
  readonly cargando = signal<boolean>(true);
  readonly errorMessage = signal<string>('');

  readonly departamento = computed(() => {
    const esp = this.especialidad();
    if (!esp) return 'Medicina General';
    const n = esp.nombre.toLowerCase();
    if (n.includes('cardio')) return 'Cardiología';
    if (n.includes('pediat') || n.includes('infan') || n.includes('materno')) return 'Materno Infantil';
    if (n.includes('trauma') || n.includes('ortop') || n.includes('cirug')) return 'Cirugía';
    if (n.includes('neuro')) return 'Neurociencias';
    if (n.includes('ginec') || n.includes('obstet')) return 'Salud Femenina';
    return 'Medicina General';
  });

  readonly icono = computed(() => {
    const esp = this.especialidad();
    if (!esp) return '🩺';
    const n = esp.nombre.toLowerCase();
    if (n.includes('cardio')) return '🫀';
    if (n.includes('pediat')) return '🍼';
    if (n.includes('trauma')) return '🦴';
    if (n.includes('neuro')) return '🧠';
    if (n.includes('ginec')) return '🤰';
    return '🩺';
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/admin/especialidades']);
      return;
    }

    const id = Number(idParam);
    this.especialidadId.set(id);
    this.cargarDatos(id);
  }

  cargarDatos(id: number): void {
    this.cargando.set(true);
    this.errorMessage.set('');

    this.especialidadService.buscarPorId(id).subscribe({
      next: (esp: Especialidad) => {
        this.especialidad.set(esp);

        this.medicoService.listar().subscribe({
          next: (medicos: Medico[]) => {
            const asignados = medicos.filter(m => m.especialidad?.idEspecialidad === id);
            this.medicosAsignados.set(asignados);
            this.cargando.set(false);
            this.cdr.markForCheck();
          },
          error: (err: any) => {
            console.error('Error al listar médicos de la especialidad:', err);
            this.medicosAsignados.set([]);
            this.cargando.set(false);
            this.cdr.markForCheck();
          }
        });
      },
      error: (err: any) => {
        console.error('Error al obtener especialidad:', err);
        this.cargando.set(false);
        this.errorMessage.set('No se encontró la especialidad médica solicitada o fue dada de baja.');
        this.cdr.markForCheck();
      }
    });
  }
}

