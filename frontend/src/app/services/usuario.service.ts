import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario, UsuarioRequest, Rol, RolRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;
  private readonly rolesUrl = `${environment.apiUrl}/roles`;

  // ================= GESTIÓN DE USUARIOS =================

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  crear(dto: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: UsuarioRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, dto);
  }

  cambiarEstado(id: number, estado: boolean): Observable<Usuario> {
    const params = new HttpParams().set('estado', estado.toString());
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/estado`, {}, { params });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ================= GESTIÓN DE ROLES =================

  listarRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.rolesUrl);
  }

  buscarRolPorId(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.rolesUrl}/${id}`);
  }

  crearRol(dto: RolRequest): Observable<Rol> {
    return this.http.post<Rol>(this.rolesUrl, dto);
  }
}

