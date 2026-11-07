import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HistoriaClinica, HistoriaClinicaRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class HistoriaClinicaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/historias-clinicas`;

  listarPorPaciente(idPaciente: number): Observable<HistoriaClinica[]> {
    return this.http.get<HistoriaClinica[]>(`${this.apiUrl}/paciente/${idPaciente}`);
  }

  buscarPorId(id: number): Observable<HistoriaClinica> {
    return this.http.get<HistoriaClinica>(`${this.apiUrl}/${id}`);
  }

  crear(dto: HistoriaClinicaRequest): Observable<HistoriaClinica> {
    return this.http.post<HistoriaClinica>(this.apiUrl, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

