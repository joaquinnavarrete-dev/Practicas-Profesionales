import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ObraSocialService, NotificationService, ConfirmModalService } from '../../services';
import { ObraSocial as ObraSocialModel } from '../../models';

export interface ObraSocialItem {
  id: number;
  nombre: string;
  sigla: string;
  tipo: 'Prepaga' | 'Obra Social' | 'Sindical';
  codigoRns: string;
  planesAdmitidos: string;
  copagoSugerido: string;
  estado: 'Activa' | 'En Revisión' | 'Suspendida';
  logoUrl: string;
}

@Component({
  selector: 'app-obras-sociales-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './obras-sociales-admin.html',
  styleUrl: './obras-sociales-admin.css'
})
export class ObrasSocialesAdminComponent implements OnInit {
  private readonly obraSocialService = inject(ObraSocialService);
  private readonly notify = inject(NotificationService);
  private readonly confirmModal = inject(ConfirmModalService);

  readonly busquedaGlobal = signal<string>('');
  readonly estadoFiltro = signal<string>('Todos');
  readonly tipoFiltro = signal<string>('Todos');

  readonly cargando = signal<boolean>(false);
  readonly obrasSociales = signal<ObraSocialItem[]>([]);

  readonly obrasSocialesFiltradas = computed(() => {
    const q = this.busquedaGlobal().toLowerCase().trim();
    const filtroEstado = this.estadoFiltro();
    const filtroTipo = this.tipoFiltro();
    const lista = this.obrasSociales();

    return lista.filter(os => {
      const matchEstado = filtroEstado === 'Todos' || os.estado === filtroEstado;
      const matchTipo = filtroTipo === 'Todos' || os.tipo === filtroTipo;
      const matchQuery = !q ||
                         os.nombre.toLowerCase().includes(q) ||
                         os.sigla.toLowerCase().includes(q) ||
                         os.codigoRns.includes(q);

      return matchEstado && matchTipo && matchQuery;
    });
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.obraSocialService.listar().subscribe({
      next: (data: ObraSocialModel[]) => {
        this.obrasSociales.set(data.map(item => this.mapearObraSocial(item)));
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar obras sociales desde la API:', err);
        this.cargando.set(false);
      }
    });
  }

  private mapearObraSocial(item: ObraSocialModel): ObraSocialItem {
    const id = item.idObraSocial;
    const nombre = item.nombre;
    const n = nombre.toLowerCase();

    let tipo: 'Prepaga' | 'Obra Social' | 'Sindical' = 'Obra Social';
    let sigla = nombre.split(' ')[0];
    let logo = '🏥';

    if (n.includes('osde') || n.includes('swiss') || n.includes('galeno') || n.includes('omint') || n.includes('medifé')) {
      tipo = 'Prepaga';
      logo = '🏢';
    } else if (n.includes('empleados') || n.includes('sindic') || n.includes('comercio') || n.includes('uocra') || n.includes('upcn')) {
      tipo = 'Sindical';
      logo = '💼';
    } else if (n.includes('pami')) {
      tipo = 'Obra Social';
      logo = '👴';
      sigla = 'PAMI';
    }

    if (n.includes('osde')) sigla = 'OSDE';
    if (n.includes('swiss')) sigla = 'Swiss Medical';
    if (n.includes('galeno')) sigla = 'Galeno';
    if (n.includes('osecac')) sigla = 'OSECAC';

    return {
      id,
      nombre,
      sigla: sigla.length > 20 ? sigla.slice(0, 18) + '...' : sigla,
      tipo,
      codigoRns: `4-${String(id).padStart(4, '0')}-0`,
      planesAdmitidos: 'Planes Generales y Corporativos',
      copagoSugerido: tipo === 'Prepaga' ? '$0 (Convenio directo)' : '$1.500',
      estado: 'Activa',
      logoUrl: logo
    };
  }

  aplicarFiltros(): void {
    // Computado reactivamente por Signals
  }

  contarPorEstado(estado: string): number {
    return this.obrasSociales().filter(os => os.estado === estado).length;
  }

  resetearFiltros(): void {
    this.busquedaGlobal.set('');
    this.estadoFiltro.set('Todos');
    this.tipoFiltro.set('Todos');
  }

  async eliminarObraSocial(os: ObraSocialItem): Promise<void> {
    const confirmado = await this.confirmModal.confirm({
      titulo: '¿Eliminar Obra Social?',
      mensaje: `¿Confirma la eliminación del convenio con "${os.nombre}"?`,
      textoConfirmar: 'Eliminar Obra Social',
      tipo: 'danger'
    });

    if (!confirmado) return;

    this.obraSocialService.eliminar(os.id).subscribe({
      next: () => {
        this.notify.success(`Obra social "${os.nombre}" eliminada exitosamente.`);
        this.cargarDatos();
      },
      error: (err) => {
        console.error('Error al eliminar obra social:', err);
        this.notify.error(err?.error?.message || 'No se pudo eliminar la obra social. Verifique que no posea pacientes afiliados registrados.');
      }
    });
  }

  cambiarEstadoConvenio(os: ObraSocialItem): void {
    let nuevoEstado: 'Activa' | 'En Revisión' | 'Suspendida' = 'Activa';
    if (os.estado === 'Activa') {
      nuevoEstado = 'Suspendida';
    } else if (os.estado === 'Suspendida') {
      nuevoEstado = 'En Revisión';
    } else {
      nuevoEstado = 'Activa';
    }

    this.obrasSociales.update(lista =>
      lista.map(item => item.id === os.id ? { ...item, estado: nuevoEstado } : item)
    );
    this.notify.info(`Estado de "${os.sigla}" cambiado a: ${nuevoEstado}`);
  }
}
