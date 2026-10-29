import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Medico, MedicoRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/medicos`;

  listar(): Observable<Medico[]> {
    return this.http.get<Medico[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Medico> {
    return this.http.get<Medico>(`${this.apiUrl}/${id}`);
  }

  listarPorEspecialidad(idEspecialidad: number): Observable<Medico[]> {
    return this.http.get<Medico[]>(`${this.apiUrl}/especialidad/${idEspecialidad}`);
  }

  crear(dto: MedicoRequest): Observable<Medico> {
    return this.http.post<Medico>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: MedicoRequest): Observable<Medico> {
    return this.http.put<Medico>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

