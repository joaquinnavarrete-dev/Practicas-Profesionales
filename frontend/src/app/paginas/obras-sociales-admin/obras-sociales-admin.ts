import { Component, OnInit, inject } from '@angular/core';
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

  busquedaGlobal: string = '';
  estadoFiltro: string = 'Todos';
  tipoFiltro: string = 'Todos';

  cargando: boolean = false;
  obrasSociales: ObraSocialItem[] = [];
  obrasSocialesFiltradas: ObraSocialItem[] = [];

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.obraSocialService.listar().subscribe({
      next: (data: ObraSocialModel[]) => {
        this.obrasSociales = data.map(item => this.mapearObraSocial(item));
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar obras sociales desde la API:', err);
        this.cargando = false;
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
    const q = this.busquedaGlobal.toLowerCase().trim();

    this.obrasSocialesFiltradas = this.obrasSociales.filter(os => {
      const matchEstado = this.estadoFiltro === 'Todos' || os.estado === this.estadoFiltro;
      const matchTipo = this.tipoFiltro === 'Todos' || os.tipo === this.tipoFiltro;
      const matchQuery = !q ||
                         os.nombre.toLowerCase().includes(q) ||
                         os.sigla.toLowerCase().includes(q) ||
                         os.codigoRns.includes(q);

      return matchEstado && matchTipo && matchQuery;
    });
  }

  contarPorEstado(estado: string): number {
    return this.obrasSociales.filter(os => os.estado === estado).length;
  }

  resetearFiltros(): void {
    this.busquedaGlobal = '';
    this.estadoFiltro = 'Todos';
    this.tipoFiltro = 'Todos';
    this.aplicarFiltros();
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
    if (os.estado === 'Activa') {
      os.estado = 'Suspendida';
    } else if (os.estado === 'Suspendida') {
      os.estado = 'En Revisión';
    } else {
      os.estado = 'Activa';
    }
    this.notify.info(`Estado de "${os.sigla}" cambiado a: ${os.estado}`);
    this.aplicarFiltros();
  }

}
