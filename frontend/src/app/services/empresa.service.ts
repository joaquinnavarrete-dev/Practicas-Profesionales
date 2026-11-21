import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EmpresaItem, EmpresaRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/empresas`;

  listar(): Observable<EmpresaItem[]> {
    return this.http.get<EmpresaItem[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<EmpresaItem> {
    return this.http.get<EmpresaItem>(`${this.apiUrl}/${id}`);
  }

  crear(dto: EmpresaRequest): Observable<EmpresaItem> {
    return this.http.post<EmpresaItem>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: EmpresaRequest): Observable<EmpresaItem> {
    return this.http.put<EmpresaItem>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

