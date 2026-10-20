import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Interfaces que modelan el dominio médico (igual que en los DTOs de Java)
export interface EspecialidadOpcion {
  id: number;
  nombre: string;
  icono: string;
}

export interface MedicoOpcion {
  id: number;
  nombre: string;
  subespecialidad: string;
  matricula: string;
  calificacion: number;
  diasAtencion: string;
  consultorio: string;
  coberturas: string;
  proximoTurnoTexto: string;
  fotoUrl: string;
}

export interface HorarioOpcion {
  hora: string;
  disponible: boolean;
  turno: 'manana' | 'tarde';
}

@Component({
  selector: 'app-solicitar-turno',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './solicitar-turno.html',
  styleUrl: './solicitar-turno.css'
})
export class SolicitarTurnoComponent {

  // Control del Stepper (Paso 1, 2, 3 o 4)
  pasoActual: number = 1;

  // Objeto Borrador: Acumula las selecciones a lo largo de los 4 pasos
  turnoBorrador = {
    especialidad: null as EspecialidadOpcion | null,
    medico: null as MedicoOpcion | null,
    fecha: '2025-10-22',
    hora: '09:30 hs',
    modalidad: 'Presencial',
    sede: 'Sede Central (Av. San Gabriel 1420)',
    // Datos del paciente (en el paso 4)
    pacienteNombre: 'Laura Rodríguez',
    pacienteDni: '34.567.890',
    pacienteTelefono: '+54 9 11 4567-8900',
    pacienteEmail: 'laura.rodriguez@email.com',
    obraSocial: 'OSDE 310',
    afiliadoNro: '•••• •••• 4821 - 01',
    copago: '$0 (Cubierto al 100%)',
    motivoConsulta: '',
    recordatorioWhatsapp: true,
    comprobanteEmail: true
  };

  // ================= PASO 1: DATOS MOCK DE ESPECIALIDADES =================
  especialidades: EspecialidadOpcion[] = [
    { id: 1, nombre: 'Cardiología', icono: '💙' },
    { id: 2, nombre: 'Pediatría', icono: '🍼' },
    { id: 3, nombre: 'Neurología', icono: '🧠' },
    { id: 4, nombre: 'Oftalmología', icono: '👁' },
    { id: 5, nombre: 'Psicología', icono: '🧩' },
    { id: 6, nombre: 'Odontología', icono: '🦷' },
    { id: 7, nombre: 'Traumatología', icono: '🦴' },
    { id: 8, nombre: 'Otras', icono: '•••' }
  ];

  // ================= PASO 2: DATOS MOCK DE MÉDICOS =================
  filtroNombreMedico: string = '';
  medicos: MedicoOpcion[] = [
    {
      id: 101,
      nombre: 'Dra. Mariana Gómez',
      subespecialidad: 'Cardiología Clínica y Ergometría',
      matricula: 'M.N. 142.589',
      calificacion: 4.9,
      diasAtencion: 'Lun, Mié y Vie',
      consultorio: 'Consultorio 204 (Piso 2)',
      coberturas: 'OSDE, Swiss Medical, Galeno, Particular',
      proximoTurnoTexto: 'Próximo: Mañana, 09:30 hs',
      fotoUrl: '👩‍⚕️'
    },
    {
      id: 102,
      nombre: 'Dr. Javier Martínez',
      subespecialidad: 'Ecocardiografía y Doppler',
      matricula: 'M.N. 118.942',
      calificacion: 4.8,
      diasAtencion: 'Mar y Jue',
      consultorio: 'Consultorio 210',
      coberturas: 'Todas las coberturas y particulares',
      proximoTurnoTexto: 'Próximo: Jueves 24, 14:00 hs',
      fotoUrl: '👨‍⚕️'
    },
    {
      id: 103,
      nombre: 'Dr. Roberto Rossi',
      subespecialidad: 'Electrofisiología y Arritmias',
      matricula: 'M.N. 95.310',
      calificacion: 4.9,
      diasAtencion: 'Lun y Vie',
      consultorio: 'Consultorio 215',
      coberturas: 'OSDE, Swiss Medical, Particular',
      proximoTurnoTexto: 'Próximo: Viernes 25, 10:15 hs',
      fotoUrl: '👨‍⚕️'
    },
    {
      id: 104,
      nombre: 'Dra. Sofía Benítez',
      subespecialidad: 'Prevención Cardiovascular e Hipertensión',
      matricula: 'M.N. 156.402',
      calificacion: 4.7,
      diasAtencion: 'Lun, Mar y Jue',
      consultorio: 'Consultorio 208',
      coberturas: 'PAMI, Medifé, Omint, Particular',
      proximoTurnoTexto: 'Próximo: Lunes 28, 16:30 hs',
      fotoUrl: '👩‍⚕️'
    }
  ];

  // ================= PASO 3: DÍAS Y HORARIOS MOCK =================
  diasMes = [
    { dia: 20, disponible: true },
    { dia: 21, disponible: true },
    { dia: 22, disponible: true, seleccionado: true },
    { dia: 23, disponible: true },
    { dia: 24, disponible: true },
    { dia: 25, disponible: false },
    { dia: 26, disponible: false },
    { dia: 27, disponible: true },
    { dia: 28, disponible: true },
    { dia: 29, disponible: true },
    { dia: 30, disponible: true },
    { dia: 31, disponible: true }
  ];

  horariosManana: HorarioOpcion[] = [
    { hora: '08:30 hs', disponible: true, turno: 'manana' },
    { hora: '09:00 hs', disponible: true, turno: 'manana' },
    { hora: '09:30 hs', disponible: true, turno: 'manana' },
    { hora: '10:15 hs', disponible: false, turno: 'manana' },
    { hora: '11:00 hs', disponible: true, turno: 'manana' },
    { hora: '11:45 hs', disponible: true, turno: 'manana' },
  ];

  horariosTarde: HorarioOpcion[] = [
    { hora: '14:30 hs', disponible: true, turno: 'tarde' },
    { hora: '15:15 hs', disponible: false, turno: 'tarde' },
    { hora: '16:00 hs', disponible: true, turno: 'tarde' },
    { hora: '17:00 hs', disponible: true, turno: 'tarde' },
    { hora: '17:45 hs', disponible: true, turno: 'tarde' },
    { hora: '18:30 hs', disponible: false, turno: 'tarde' },
  ];

  constructor(private router: Router) {
    // Selección por defecto del mockup para que no arranque vacío
    this.turnoBorrador.especialidad = this.especialidades[0];
    this.turnoBorrador.medico = this.medicos[0];
  }

  // ================= LÓGICA DE TRANSICIÓN ENTRE PASOS =================

  seleccionarEspecialidad(esp: EspecialidadOpcion) {
    this.turnoBorrador.especialidad = esp;
  }

  seleccionarMedico(med: MedicoOpcion) {
    this.turnoBorrador.medico = med;
  }

  seleccionarHorario(h: HorarioOpcion) {
    if (!h.disponible) return;
    this.turnoBorrador.hora = h.hora;
  }

  avanzar() {
    if (this.pasoActual < 4) {
      this.pasoActual++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.confirmarReservaFinal();
    }
  }

  retroceder() {
    if (this.pasoActual > 1) {
      this.pasoActual--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Si está en el paso 1 y cancela, vuelve al inicio
      this.router.navigate(['/']);
    }
  }

  irAlPaso(paso: number) {
    // Permite volver a un paso anterior haciendo clic en los botones de "Cambiar"
    if (paso < this.pasoActual) {
      this.pasoActual = paso;
    }
  }

  // ================= DISPARADOR FINAL HACIA BACKEND =================
  confirmarReservaFinal() {
    // Objeto listo para mandar como payload JSON a Spring Boot
    const payloadBackend = {
      especialidadId: this.turnoBorrador.especialidad?.id,
      medicoId: this.turnoBorrador.medico?.id,
      fecha: this.turnoBorrador.fecha,
      hora: this.turnoBorrador.hora,
      dniPaciente: this.turnoBorrador.pacienteDni,
      motivoConsulta: this.turnoBorrador.motivoConsulta,
      notificarWhatsapp: this.turnoBorrador.recordatorioWhatsapp,
      notificarEmail: this.turnoBorrador.comprobanteEmail
    };

    console.log('ENVIANDO TURNO A SPRING BOOT:', payloadBackend);
    alert('¡Turno confirmado con éxito en San Gabriel!');
    this.router.navigate(['/']);
  }
}