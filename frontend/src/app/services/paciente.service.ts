import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Paciente, PacienteRequest, ActualizarPerfilPacienteRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/pacientes`;

  // Autogestión de perfil (Paciente autenticado)
  obtenerMiPerfil(): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.apiUrl}/mi-perfil`);
  }

  actualizarMiPerfil(dto: ActualizarPerfilPacienteRequest): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.apiUrl}/mi-perfil`, dto);
  }

  // Gestión Administrativa (Admin / Recepción)
  listar(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.apiUrl}/${id}`);
  }

  buscarPorDni(dni: string): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.apiUrl}/dni/${dni}`);
  }

  listarPorObraSocial(idObraSocial: number): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(`${this.apiUrl}/obra-social/${idObraSocial}`);
  }

  crear(dto: PacienteRequest): Observable<Paciente> {
    return this.http.post<Paciente>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: PacienteRequest): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

