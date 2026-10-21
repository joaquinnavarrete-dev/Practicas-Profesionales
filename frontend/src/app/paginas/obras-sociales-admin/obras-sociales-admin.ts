import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Modelo DTO de Obra Social / Prepaga (Mapeable a ObraSocialEntity en Spring Boot)
export interface ObraSocial {
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
  imports: [CommonModule, FormsModule],
  templateUrl: './obras-sociales-admin.html',
  styleUrl: './obras-sociales-admin.css'
})
export class ObrasSocialesAdminComponent {

  // Variables de filtrado en pantalla
  busquedaGlobal: string = '';
  estadoFiltro: string = 'Todos';
  tipoFiltro: string = 'Todos';

  // Padrón mock de coberturas habilitadas en la clínica
  // Futuro endpoint: GET /api/obras-sociales
  obrasSociales: ObraSocial[] = [
    {
      id: 1,
      nombre: 'Organización de Servicios Directos Empresarios',
      sigla: 'OSDE',
      tipo: 'Prepaga',
      codigoRns: '4-0080-0',
      planesAdmitidos: 'Plan 210, 310, 410, 450, 510',
      copagoSugerido: '$0 (Sin Copago)',
      estado: 'Activa',
      logoUrl: '🏢'
    },
    {
      id: 2,
      nombre: 'Swiss Medical Medicina Privada',
      sigla: 'Swiss Medical',
      tipo: 'Prepaga',
      codigoRns: '4-0120-2',
      planesAdmitidos: 'Sual, Qualitas, Docthos, Premium',
      copagoSugerido: '$0 (Sin Copago)',
      estado: 'Activa',
      logoUrl: '🏥'
    },
    {
      id: 3,
      nombre: 'Galeno Argentina S.A.',
      sigla: 'Galeno',
      tipo: 'Prepaga',
      codigoRns: '4-0050-1',
      planesAdmitidos: 'Blanco, Azul, Plata, Oro 450',
      copagoSugerido: '$2.500 (Arancel fijo)',
      estado: 'Activa',
      logoUrl: '⚕️'
    },
    {
      id: 4,
      nombre: 'Instituto Nacional de Servicios Sociales (PAMI)',
      sigla: 'PAMI',
      tipo: 'Obra Social',
      codigoRns: '0-0010-0',
      planesAdmitidos: 'Colectivo General y Jubilados',
      copagoSugerido: '$0 (100% Cubierto)',
      estado: 'En Revisión',
      logoUrl: '👴'
    },
    {
      id: 5,
      nombre: 'Obra Social de Empleados de Comercio (OSECAC)',
      sigla: 'OSECAC',
      tipo: 'Sindical',
      codigoRns: '1-0540-3',
      planesAdmitidos: 'General Beneficiarios',
      copagoSugerido: '$1.800',
      estado: 'Activa',
      logoUrl: '💼'
    },
    {
      id: 6,
      nombre: 'Omint S.A. de Servicios',
      sigla: 'Omint',
      tipo: 'Prepaga',
      codigoRns: '4-0030-9',
      planesAdmitidos: 'F300, F400, F500, Skill',
      copagoSugerido: '$3.000',
      estado: 'Suspendida',
      logoUrl: '🚑'
    }
  ];

  obrasSocialesFiltradas: ObraSocial[] = [...this.obrasSociales];

  constructor() {
    this.aplicarFiltros();
  }

  // Filtra la tabla cruzando búsqueda por texto, estado y tipo de entidad
  aplicarFiltros(): void {
    const q = this.busquedaGlobal.toLowerCase().trim();

    this.obrasSocialesFiltradas = this.obrasSociales.filter(os => {
      const matchEstado = this.estadoFiltro === 'Todos' || os.estado === this.estadoFiltro;
      const matchTipo = this.tipoFiltro === 'Todos' || os.tipo === this.tipoFiltro;
      const matchQuery = os.nombre.toLowerCase().includes(q) ||
                         os.sigla.toLowerCase().includes(q) ||
                         os.codigoRns.includes(q);

      return matchEstado && matchTipo && matchQuery;
    });
  }

  // Retorna el conteo de obras sociales según su estado de convenio
  contarPorEstado(estado: string): number {
    return this.obrasSociales.filter(os => os.estado === estado).length;
  }

  // Resetea los filtros al estado original
  resetearFiltros(): void {
    this.busquedaGlobal = '';
    this.estadoFiltro = 'Todos';
    this.tipoFiltro = 'Todos';
    this.aplicarFiltros();
  }

  // Abre la ventana modal para dar de alta una nueva cobertura
  abrirModalCrear(): void {
    console.log('Abriendo modal de creación de obra social...');
  }

  // Abre la edición del convenio seleccionado
  editarObraSocial(os: ObraSocial): void {
    console.log('Editando obra social ID:', os.id);
  }

  // Alterna o modifica el estado del convenio (Activa, En Revisión, Suspendida)
  cambiarEstadoConvenio(os: ObraSocial): void {
    console.log('Cambiando estado de convenio para:', os.sigla);
  }

}