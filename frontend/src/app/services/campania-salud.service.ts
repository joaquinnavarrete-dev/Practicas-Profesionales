import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CampaniaSalud, CampaniaRequest } from '../models';

@Injectable({
    providedIn: 'root'
})
export class CampaniaSaludService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/campanias`;

    listar(): Observable<CampaniaSalud[]> {
        return this.http.get<CampaniaSalud[]>(this.apiUrl);
    }

    buscarPorId(id: number): Observable<CampaniaSalud> {
        return this.http.get<CampaniaSalud>(`${this.apiUrl}/${id}`);
    }

    crear(dto: CampaniaRequest): Observable<CampaniaSalud> {
        return this.http.post<CampaniaSalud>(this.apiUrl, dto);
    }

    actualizar(id: number, dto: CampaniaRequest): Observable<CampaniaSalud> {
        return this.http.put<CampaniaSalud>(`${this.apiUrl}/${id}`, dto);
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

}
