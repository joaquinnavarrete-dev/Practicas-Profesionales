import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ObraSocial, ObraSocialRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ObraSocialService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/obras-sociales`;

  listar(): Observable<ObraSocial[]> {
    return this.http.get<ObraSocial[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<ObraSocial> {
    return this.http.get<ObraSocial>(`${this.apiUrl}/${id}`);
  }

  crear(dto: ObraSocialRequest): Observable<ObraSocial> {
    return this.http.post<ObraSocial>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: ObraSocialRequest): Observable<ObraSocial> {
    return this.http.put<ObraSocial>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

