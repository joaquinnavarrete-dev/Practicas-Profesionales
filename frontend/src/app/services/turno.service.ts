import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Turno,
  TurnoRequest,
  SolicitarTurnoRequest,
  ReprogramarTurnoRequest,
  TurnoDisponible
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class TurnoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/turnos`;

  // ================= AUTOGESTIÓN DE PACIENTES =================

  /**
   * Obtiene la lista de turnos pertenecientes al paciente autenticado
   */
  listarMisTurnos(): Observable<Turno[]> {
    return this.http.get<Turno[]>(`${this.apiUrl}/mis-turnos`);
  }

  /**
   * Solicita y reserva un turno para el paciente autenticado
   */
  solicitarMiTurno(dto: SolicitarTurnoRequest): Observable<Turno> {
    return this.http.post<Turno>(`${this.apiUrl}/solicitar`, dto);
  }

  /**
   * Cancela un turno propio del paciente autenticado
   */
  cancelarMiTurno(idTurno: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/mis-turnos/${idTurno}`);
  }

  // ================= CONSULTAS PÚBLICAS Y DE AGENDA =================

  /**
   * Consulta slots de turnos de 30 min y su disponibilidad para un médico en una fecha específica
   * @param idMedico ID del profesional
   * @param fecha Fecha en formato ISO 'YYYY-MM-DD'
   */
  consultarDisponibles(idMedico: number, fecha: string): Observable<TurnoDisponible[]> {
    const params = new HttpParams()
      .set('idMedico', idMedico.toString())
      .set('fecha', fecha);
    return this.http.get<TurnoDisponible[]>(`${this.apiUrl}/disponibles`, { params });
  }

  /**
   * Consulta la agenda completa de turnos para un médico y fecha determinada
   */
  listarAgenda(idMedico: number, fecha: string): Observable<Turno[]> {
    const params = new HttpParams()
      .set('idMedico', idMedico.toString())
      .set('fecha', fecha);
    return this.http.get<Turno[]>(`${this.apiUrl}/agenda`, { params });
  }

  // ================= GESTIÓN ADMINISTRATIVA =================

  /**
   * Lista todos los turnos registrados en el sistema
   */
  listarTodos(): Observable<Turno[]> {
    return this.http.get<Turno[]>(this.apiUrl);
  }

  /**
   * Busca un turno por su ID
   */
  buscarPorId(id: number): Observable<Turno> {
    return this.http.get<Turno>(`${this.apiUrl}/${id}`);
  }

  /**
   * Lista turnos asignados a un paciente por su ID
   */
  listarPorPaciente(idPaciente: number): Observable<Turno[]> {
    return this.http.get<Turno[]>(`${this.apiUrl}/paciente/${idPaciente}`);
  }

  /**
   * Reserva manual de turno desde recepción o administración
   */
  reservarAdmin(dto: TurnoRequest): Observable<Turno> {
    return this.http.post<Turno>(this.apiUrl, dto);
  }

  /**
   * Reprograma fecha y hora de un turno existente
   */
  reprogramar(idTurno: number, dto: ReprogramarTurnoRequest): Observable<Turno> {
    return this.http.put<Turno>(`${this.apiUrl}/${idTurno}/reprogramar`, dto);
  }

  /**
   * Cancela/elimina un turno por su ID (Administrador o Recepcionista)
   */
  cancelar(idTurno: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idTurno}`);
  }
}

