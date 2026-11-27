import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SedeService } from '../../services';
import { NotificationService } from '../../services';
import { ConfirmModalService } from '../../services';
import { Sede, SedeRequest } from '../../models';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-sedes-admin',
  styleUrl: './sedes-admin.css',
  templateUrl: './sedes-admin.html',
})
export class SedesAdminComponent implements OnInit {

  private readonly sedeService = inject(SedeService);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmModalService = inject(ConfirmModalService);

  readonly listaSedes = signal<Sede[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly guardando = signal<boolean>(false);
  readonly editandoId = signal<number | null>(null);
  readonly mostrarFormulario = signal<boolean>(false);

  formData: SedeRequest = {
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    horario_atencion: '',
    activa: true
  };

  ngOnInit(): void {
    this.cargarSedes();
  }

  cargarSedes(): void {
    this.cargando.set(true);
    this.sedeService.listar().subscribe({
      next: (sedes) => {
        this.listaSedes.set(sedes);
        this.cargando.set(false);
      },
      error: () => {
        this.notificationService.error('Error al cargar las sedes');
        this.cargando.set(false);
      }
    });
  }

  abrirCrear(): void {
    this.editandoId.set(null);
    this.formData = {
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      horario_atencion: '',
      activa: true
    };
    this.mostrarFormulario.set(true);
  }

  abrirEditar(s: Sede): void {
    this.editandoId.set(s.id);
    this.formData = {
      nombre: s.nombre,
      direccion: s.direccion,
      telefono: s.telefono,
      email: s.email,
      horario_atencion: s.horario_atencion,
      activa: s.activa
    };
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.editandoId.set(null);
  }

  guardar(): void {
    if (!this.formData.nombre) {
      this.notificationService.warning('Por favor complete los campos obligatorios');
      return;
    }

    this.guardando.set(true);
    const id = this.editandoId();

    if (id) {
      // actualizamos la sede
      this.sedeService.actualizar(id, this.formData).subscribe({
        next: () => {
          this.notificationService.success('Sede actualizada correctamente');
          this.guardando.set(false);
          this.cerrarFormulario();
          this.cargarSedes();
        },
        error: (err) => {
          this.notificationService.error(err?.error?.message || 'Error al actualizar la sede');
          this.guardando.set(false);
        }
      });
    } else {
      // creamos una sede
      this.sedeService.crear(this.formData).subscribe({
        next: () => {
          this.notificationService.success('Sede creada correctamente');
          this.guardando.set(false);
          this.cerrarFormulario();
          this.cargarSedes();
        },
        error: (err) => {
          this.notificationService.error(err?.error?.message || 'Error al crear la sede');
          this.guardando.set(false);
        }
      });
    }
  }

  async eliminar(s: Sede): Promise<void> {
    const confirmado = await this.confirmModalService.confirm({
      titulo: 'Eliminar Sede',
      mensaje: `¿Seguro que desea eliminar la sede "${s.nombre}?"`,
      textoConfirmar: 'Eliminar',
      tipo: 'danger'
    });

    if (!confirmado) return;

    this.sedeService.eliminar(s.id).subscribe({
      next: () => {
        this.notificationService.success('Sede eliminada con exito');
        this.cargarSedes();
      },
      error: () => {
        this.notificationService.error('Error al eliminar la sede');
      }
    });
  }

}
