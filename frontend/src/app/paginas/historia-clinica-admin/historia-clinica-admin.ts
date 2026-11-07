import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminTopbarComponent } from '../../componentes/admin-topbar/admin-topbar';
import { PacienteService, MedicoService, HistoriaClinicaService, NotificationService, ConfirmModalService, AuthService } from '../../services';
import { Paciente, Medico, HistoriaClinica, HistoriaClinicaRequest } from '../../models';

@Component({
  selector: 'app-historia-clinica-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminTopbarComponent],
  templateUrl: './historia-clinica-admin.html',
  styleUrl: './historia-clinica-admin.css'
})
export class HistoriaClinicaAdminComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pacienteService = inject(PacienteService);
  private readonly medicoService = inject(MedicoService);
  private readonly historiaClinicaService = inject(HistoriaClinicaService);
  private readonly notify = inject(NotificationService);
  private readonly confirmModal = inject(ConfirmModalService);
  readonly authService = inject(AuthService);

  readonly paciente = signal<Paciente | null>(null);
  readonly medicos = signal<Medico[]>([]);
  readonly registros = signal<HistoriaClinica[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly guardando = signal<boolean>(false);
  readonly mostrarFormulario = signal<boolean>(false);
  readonly busqueda = signal<string>('');

  formFecha = '';
  formIdMedico: number = 0;
  formMotivoConsulta = '';
  formDiagnostico = '';
  formTratamiento = '';
  formObservaciones = '';

  readonly registrosFiltrados = computed(() => {
    const query = this.busqueda().toLowerCase().trim();
    const lista = this.registros();
    if (!query) return lista;

    return lista.filter(r =>
      (r.motivoConsulta && r.motivoConsulta.toLowerCase().includes(query)) ||
      (r.diagnostico && r.diagnostico.toLowerCase().includes(query)) ||
      (r.tratamiento && r.tratamiento.toLowerCase().includes(query)) ||
      (r.observaciones && r.observaciones.toLowerCase().includes(query)) ||
      (r.medico && (r.medico.nombre.toLowerCase().includes(query) || r.medico.apellido.toLowerCase().includes(query)))
    );
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('idPaciente');
    const idPaciente = Number(idParam);

    if (!idPaciente) {
      this.notify.error('Identificador de paciente no válido');
      this.router.navigate(['/admin/pacientes']);
      return;
    }

    this.formFecha = new Date().toISOString().split('T')[0];
    this.cargarDatos(idPaciente);
  }

  cargarDatos(idPaciente: number): void {
    this.cargando.set(true);

    this.pacienteService.buscarPorId(idPaciente).subscribe({
      next: (pac) => {
        this.paciente.set(pac);
        this.cargarHistoriasClinicas(idPaciente);
        this.cargarMedicos();
      },
      error: (err) => {
        console.error('Error al cargar datos del paciente:', err);
        this.notify.error('No se pudo encontrar la información del paciente solicitado');
        this.cargando.set(false);
      }
    });
  }

  cargarHistoriasClinicas(idPaciente: number): void {
    this.historiaClinicaService.listarPorPaciente(idPaciente).subscribe({
      next: (data) => {
        this.registros.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar historia clínica:', err);
        this.notify.error('No se pudo cargar el historial clínico del paciente');
        this.cargando.set(false);
      }
    });
  }

  cargarMedicos(): void {
    this.medicoService.listar().subscribe({
      next: (medicosList) => {
        this.medicos.set(medicosList);

        const currentUserId = this.authService.currentUser()?.idMedico;
        if (this.authService.isMedico() && currentUserId) {
          this.formIdMedico = currentUserId;
        } else if (medicosList.length > 0 && !this.formIdMedico) {
          this.formIdMedico = medicosList[0].idMedico;
        }
      },
      error: (err) => {
        console.error('Error al cargar médicos:', err);
      }
    });
  }

  toggleFormulario(): void {
    this.mostrarFormulario.update(val => !val);
  }

  guardarEvolucion(): void {
    const pac = this.paciente();
    if (!pac) return;

    if (!this.formFecha) {
      this.notify.warning('Debe especificar la fecha de la atención');
      return;
    }
    if (!this.formIdMedico) {
      this.notify.warning('Debe seleccionar el profesional médico que efectúa la atención');
      return;
    }
    if (!this.formMotivoConsulta.trim()) {
      this.notify.warning('El motivo de la consulta es obligatorio');
      return;
    }
    if (!this.formDiagnostico.trim()) {
      this.notify.warning('El diagnóstico médico es obligatorio');
      return;
    }

    const payload: HistoriaClinicaRequest = {
      idPaciente: pac.idPaciente,
      idMedico: Number(this.formIdMedico),
      fecha: this.formFecha,
      motivoConsulta: this.formMotivoConsulta.trim(),
      diagnostico: this.formDiagnostico.trim(),
      tratamiento: this.formTratamiento.trim() || undefined,
      observaciones: this.formObservaciones.trim() || undefined
    };

    this.guardando.set(true);
    this.historiaClinicaService.crear(payload).subscribe({
      next: (nuevo) => {
        this.guardando.set(false);
        this.notify.success('Evolución médica registrada correctamente');
        this.formMotivoConsulta = '';
        this.formDiagnostico = '';
        this.formTratamiento = '';
        this.formObservaciones = '';
        this.mostrarFormulario.set(false);
        this.cargarHistoriasClinicas(pac.idPaciente);
      },
      error: (err) => {
        console.error('Error al registrar evolución médica:', err);
        this.guardando.set(false);
        this.notify.error('No se pudo registrar la evolución médica. Verifique los datos ingresados.');
      }
    });
  }

  eliminarEvolucion(registro: HistoriaClinica): void {
    this.confirmModal.confirm({
      titulo: 'Eliminar Entrada de Historia Clínica',
      mensaje: `¿Está seguro de que desea eliminar la atención del ${registro.fecha}? Esta acción no se puede deshacer.`,
      textoConfirmar: 'Sí, Eliminar',
      textoCancelar: 'Cancelar',
      tipo: 'danger'
    }).then((confirmado) => {
      if (!confirmado) return;

      this.historiaClinicaService.eliminar(registro.idHistoriaClinica).subscribe({
        next: () => {
          this.notify.success('Registro de evolución médica eliminado con éxito');
          const pac = this.paciente();
          if (pac) this.cargarHistoriasClinicas(pac.idPaciente);
        },
        error: (err) => {
          console.error('Error al eliminar registro:', err);
          this.notify.error('No se pudo eliminar el registro seleccionado');
        }
      });
    });
  }

  imprimirHistoria(): void {
    window.print();
  }

  volver(): void {
    if (this.authService.isMedico()) {
      this.router.navigate(['/admin/pacientes-por-medico']);
    } else {
      this.router.navigate(['/admin/pacientes']);
    }
  }
}
