import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Modelo DTO de Paciente (Mapeable a PacienteEntity en Spring Boot)
export interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  genero: string;
  edad: number;
  numHistoriaClinica: string;
  telefono: string;
  email: string;
  obraSocial: string;
  planAfiliado: string;
  ultimaVisita: string;
  estado: 'Activo' | 'Inactivo';
  avatarUrl: string;
}

@Component({
  selector: 'app-pacientes-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes-admin.html',
  styleUrl: './pacientes-admin.css'
})
export class PacientesAdminComponent {

  // Variables de filtrado
  busquedaGlobal: string = '';
  obraSocialFiltro: string = 'Todas';
  estadoFiltro: string = 'Todos';

  // Padrón mock de pacientes registrados
  // Futuro endpoint: GET /api/pacientes
  pacientes: Paciente[] = [
    {
      id: 1,
      nombre: 'Laura',
      apellido: 'Rodríguez',
      dni: '34.567.890',
      genero: 'Femenino',
      edad: 36,
      numHistoriaClinica: 'HC-90412',
      telefono: '+54 9 11 4567-8900',
      email: 'laura.rodriguez@email.com',
      obraSocial: 'Swiss Medical',
      planAfiliado: 'Plan Sual • N° 108422',
      ultimaVisita: '22 Oct 2025',
      estado: 'Activo',
      avatarUrl: '👩'
    },
    {
      id: 2,
      nombre: 'Carlos Eduardo',
      apellido: 'Fernández',
      dni: '28.452.109',
      genero: 'Masculino',
      edad: 48,
      numHistoriaClinica: 'HC-84201',
      telefono: '+54 9 11 5821-9042',
      email: 'carlos.fernandez@email.com',
      obraSocial: 'OSDE',
      planAfiliado: 'Plan 310 • N° 482109',
      ultimaVisita: '22 Oct 2025',
      estado: 'Activo',
      avatarUrl: '👨'
    },
    {
      id: 3,
      nombre: 'Martín Gonzalo',
      apellido: 'Peralta',
      dni: '40.128.943',
      genero: 'Masculino',
      edad: 28,
      numHistoriaClinica: 'HC-10482',
      telefono: '+54 9 11 3104-5829',
      email: 'martin.peralta@email.com',
      obraSocial: 'Galeno',
      planAfiliado: 'Oro 450 • N° 994012',
      ultimaVisita: '15 Sep 2025',
      estado: 'Activo',
      avatarUrl: '👨'
    },
    {
      id: 4,
      nombre: 'Elena Beatríz',
      apellido: 'Rossi',
      dni: '22.940.182',
      genero: 'Femenino',
      edad: 64,
      numHistoriaClinica: 'HC-34901',
      telefono: '+54 9 11 6940-1122',
      email: 'elena.rossi@email.com',
      obraSocial: 'PAMI',
      planAfiliado: 'Beneficiario N° 0029482',
      ultimaVisita: '01 Oct 2025',
      estado: 'Activo',
      avatarUrl: '👵'
    },
    {
      id: 5,
      nombre: 'Lucas Nahuel',
      apellido: 'Torres',
      dni: '38.904.211',
      genero: 'Masculino',
      edad: 31,
      numHistoriaClinica: 'HC-77401',
      telefono: '+54 9 11 2049-8833',
      email: 'lucas.torres@email.com',
      obraSocial: 'Particular',
      planAfiliado: 'Sin Cobertura',
      ultimaVisita: '10 Ago 2025',
      estado: 'Inactivo',
      avatarUrl: '👨'
    }
  ];

  pacientesFiltrados: Paciente[] = [...this.pacientes];

  constructor() {
    this.aplicarFiltros();
  }

  // Filtra por búsqueda de texto (nombre, apellido, DNI, HC), obra social y estado
  aplicarFiltros(): void {
    const q = this.busquedaGlobal.toLowerCase().trim();

    this.pacientesFiltrados = this.pacientes.filter(p => {
      const matchOS = this.obraSocialFiltro === 'Todas' || p.obraSocial === this.obraSocialFiltro;
      const matchEstado = this.estadoFiltro === 'Todos' || p.estado === this.estadoFiltro;
      
      const nombreCompleto = `${p.nombre} ${p.apellido}`.toLowerCase();
      const matchQuery = nombreCompleto.includes(q) ||
                         p.dni.includes(q) ||
                         p.numHistoriaClinica.toLowerCase().includes(q);

      return matchOS && matchEstado && matchQuery;
    });
  }

  // Cuenta cantidad de pacientes por estado
  contarPorEstado(estado: string): number {
    return this.pacientes.filter(p => p.estado === estado).length;
  }

  // Cuenta cantidad de pacientes con cobertura (excluye Particular)
  contarConCobertura(): number {
    return this.pacientes.filter(p => p.obraSocial !== 'Particular').length;
  }

  // Resetea filtros a valor por defecto
  resetearFiltros(): void {
    this.busquedaGlobal = '';
    this.obraSocialFiltro = 'Todas';
    this.estadoFiltro = 'Todos';
    this.aplicarFiltros();
  }

  // Acciones rápidas de botones
  abrirModalCrear(): void {
    console.log('Abriendo modal de alta de paciente...');
  }

  verHistoriaClinica(p: Paciente): void {
    console.log('Ver Historia Clínica de paciente ID:', p.id);
  }

  editarPaciente(p: Paciente): void {
    console.log('Editando paciente ID:', p.id);
  }

  cambiarEstadoPaciente(p: Paciente): void {
    console.log('Cambiando estado activo/inactivo para paciente ID:', p.id);
  }

}