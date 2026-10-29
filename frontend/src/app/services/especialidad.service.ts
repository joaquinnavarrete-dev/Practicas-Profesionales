import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Especialidad, EspecialidadRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/especialidades`;

  listar(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Especialidad> {
    return this.http.get<Especialidad>(`${this.apiUrl}/${id}`);
  }

  crear(dto: EspecialidadRequest): Observable<Especialidad> {
    return this.http.post<Especialidad>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: EspecialidadRequest): Observable<Especialidad> {
    return this.http.put<Especialidad>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

