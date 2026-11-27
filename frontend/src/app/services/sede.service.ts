import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Sede, SedeRequest } from '../models';

@Injectable({
    providedIn: 'root'
})
export class SedeService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/sedes`;

    listar(): Observable<Sede[]> {
        return this.http.get<Sede[]>(this.apiUrl);
    }

    buscarPorId(id: number): Observable<Sede> {
        return this.http.get<Sede>(`${this.apiUrl}/${id}`);
    }

    crear(dto: SedeRequest): Observable<Sede> {
        return this.http.post<Sede>(this.apiUrl, dto);
    }

    actualizar(id: number, dto: SedeRequest): Observable<Sede> {
        return this.http.put<Sede>(`${this.apiUrl}/${id}`, dto);
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
