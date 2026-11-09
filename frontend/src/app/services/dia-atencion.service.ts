import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { DiaAtencion, DiaAtencionRequest, Turno } from '../models';

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

  actualizar(id: number, dto: DiaAtencionRequest, forzar: boolean = false): Observable<DiaAtencion> {
    const params = new HttpParams().set('forzar', forzar.toString());
    return this.http.put<DiaAtencion>(`${this.apiUrl}/${id}`, dto, { params });
  }

  eliminar(id: number, forzar: boolean = false): Observable<void> {
    const params = new HttpParams().set('forzar', forzar.toString());
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { params });
  }

  obtenerTurnosAfectados(id: number, nuevoDiaSemana?: string, nuevaHoraInicio?: string, nuevaHoraFin?: string): Observable<Turno[]> {
    let params = new HttpParams();
    if (nuevoDiaSemana) params = params.set('nuevoDiaSemana', nuevoDiaSemana);
    if (nuevaHoraInicio) params = params.set('nuevaHoraInicio', nuevaHoraInicio);
    if (nuevaHoraFin) params = params.set('nuevaHoraFin', nuevaHoraFin);

    return this.http.get<Turno[]>(`${this.apiUrl}/${id}/turnos-afectados`, { params });
  }

  obtenerTurnosAfectadosPorEliminacion(id: number): Observable<Turno[]> {
    return this.http.get<Turno[]>(`${this.apiUrl}/${id}/turnos-afectados`);
  }
}
