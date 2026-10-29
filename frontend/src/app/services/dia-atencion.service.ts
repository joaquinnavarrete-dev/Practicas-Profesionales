import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { DiaAtencion, DiaAtencionRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DiaAtencionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/dias-atencion`;

  listar(): Observable<DiaAtencion[]> {
    return this.http.get<DiaAtencion[]>(this.apiUrl).pipe(
      catchError(() => of([]))
    );
  }

  buscarPorId(id: number): Observable<DiaAtencion> {
    return this.http.get<DiaAtencion>(`${this.apiUrl}/${id}`);
  }

  buscarPorMedico(idMedico: number): Observable<DiaAtencion[]> {
    return this.http.get<DiaAtencion[]>(`${this.apiUrl}/medico/${idMedico}`).pipe(
      catchError(() => of([]))
    );
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
