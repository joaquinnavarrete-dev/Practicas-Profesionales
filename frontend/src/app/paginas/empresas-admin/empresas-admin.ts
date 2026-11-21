import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpresaService, NotificationService, ConfirmModalService } from '../../services';
import { EmpresaRequest } from '../../models';
import { EmpresaItem } from '../../models';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-empresas-admin',
  styleUrl: './empresas-admin.css',
  templateUrl: './empresas-admin.html',
})
export class EmpresasAdminComponent implements OnInit {

  private readonly empresaService = inject(EmpresaService);
  private readonly notificacionService = inject(NotificationService);
  private readonly confirmModalService = inject(ConfirmModalService);

  readonly empresas = signal<EmpresaItem[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly guardando = signal<boolean>(false);
  readonly mostrarFormulario = signal<boolean>(false);
  readonly editandoId = signal<number | null>(null);

  formData: EmpresaRequest = {
    nombre: '',
    cuit: '',
    domicilio: '',
    telefono: '',
    email: '',
    rubro: ''
  };

  ngOnInit(): void {
    this.cargarEmpresas();
  }

  cargarEmpresas(): void {
    this.cargando.set(true);
    this.empresaService.listar().subscribe({
      next: (data) => {
        this.empresas.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.notificacionService.error('Error al cargar las empresas');
        this.cargando.set(false);
      }
    });
  }

  //crear
  abrirCrear(): void {
    this.editandoId.set(null);
    this.formData = {
      nombre: '',
      cuit: '',
      domicilio: '',
      telefono: '',
      email: '',
      rubro: ''
    };
    this.mostrarFormulario.set(true);
  }

  //editar
  abrirEditar(emp: EmpresaItem): void {
    this.editandoId.set(emp.id);
    this.formData = {
      nombre: emp.nombre,
      cuit: emp.cuit,
      domicilio: emp.domicilio,
      telefono: emp.telefono,
      email: emp.email,
      rubro: emp.rubro
    };
    this.mostrarFormulario.set(true);
  }

  //cerrar formularios
  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.editandoId.set(null);
  }

  //guardar
  guardar(): void {
    if (!this.formData.nombre || !this.formData.cuit) {
      this.notificacionService.warning('Por favor complete los campos obligatorios');
      return;
    }

    this.guardando.set(true);
    const id = this.editandoId();

    if (id) {
      //hacemos el put
      this.empresaService.actualizar(id, this.formData).subscribe({
        next: () => {
          this.notificacionService.success('Empresa actualizada exitosamente');
          this.guardando.set(false);
          this.cerrarFormulario();
          this.cargarEmpresas();
        },
        error: (err) => {
          this.notificacionService.error(err?.error?.message || 'Error al actualizar');
          this.guardando.set(false);
        }
      });
    } else {
      //hacemos el post
      this.empresaService.crear(this.formData as EmpresaRequest).subscribe({
        next: () => {
          this.notificacionService.success('Empresa registrada exitosamente');
          this.guardando.set(false);
          this.cerrarFormulario();
          this.cargarEmpresas();
        },
        error: (err) => {
          this.notificacionService.error(err?.error?.message || 'Error al crear');
          console.log(this.formData);
          console.log(err);
          this.guardando.set(false);
        }
      });
    }
  }

  // eliminar
  async eliminar(emp: EmpresaItem): Promise<void> {
    const confirmado = await this.confirmModalService.confirm({
      titulo: '¿Eliminar empresa?',
      mensaje: `¿Confirma la eliminacion de "${emp.nombre}"?`,
      textoConfirmar: 'Eliminar',
      tipo: 'danger'
    });

    if (!confirmado) return;

    this.empresaService.eliminar(emp.id).subscribe({
      next: () => {
        this.notificacionService.success('Empresa eliminada exitosamente');
        this.cargarEmpresas();
      },
      error: () => {
        this.notificacionService.error('No se pudo eliminar la empresa')
      }
    });
  }

}
