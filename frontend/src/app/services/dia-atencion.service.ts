import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DiaAtencion, DiaAtencionRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DiaAtencionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/dias-atencion`;

  listar(): Observable<DiaAtencion[]> {
    return this.http.get<DiaAtencion[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<DiaAtencion> {
    return this.http.get<DiaAtencion>(`${this.apiUrl}/${id}`);
  }

  buscarPorMedico(idMedico: number): Observable<DiaAtencion[]> {
    return this.http.get<DiaAtencion[]>(`${this.apiUrl}/medico/${idMedico}`);
  }

  crear(dto: DiaAtencionRequest): Observable<DiaAtencion> {
    return this.http.post<DiaAtencion>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: DiaAtencionRequest): Observable<DiaAtencion> {
    return this.http.put<DiaAtencion>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

