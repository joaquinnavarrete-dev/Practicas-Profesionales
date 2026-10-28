import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthRequest, AuthResponse, RegistroPacienteRequest, UsuarioSesion } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  readonly currentUser = signal<UsuarioSesion | null>(this.obtenerUsuarioInicial());
  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly userRole = computed(() => this.currentUser()?.rol ?? null);

  login(credenciales: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credenciales).pipe(
      tap((res) => this.guardarSesion(res))
    );
  }

  registroPaciente(datos: RegistroPacienteRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/registro-paciente`, datos).pipe(
      tap((res) => this.guardarSesion(res))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  hasRole(rol: string): boolean {
    const rolActual = this.userRole();
    if (!rolActual) return false;
    const rolNormalizado = rol.startsWith('ROLE_') ? rol : `ROLE_${rol}`;
    const rolActualNormalizado = rolActual.startsWith('ROLE_') ? rolActual : `ROLE_${rolActual}`;
    return rolActualNormalizado === rolNormalizado;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMINISTRADOR');
  }

  isMedico(): boolean {
    return this.hasRole('MEDICO');
  }

  isRecepcionista(): boolean {
    return this.hasRole('RECEPCIONISTA');
  }

  isPaciente(): boolean {
    return this.hasRole('PACIENTE');
  }

  private guardarSesion(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    const sesion: UsuarioSesion = {
      idUsuario: res.idUsuario,
      nombreUsuario: res.nombreUsuario,
      rol: res.rol,
      idPaciente: res.idPaciente,
      idMedico: res.idMedico
    };
    localStorage.setItem('usuario', JSON.stringify(sesion));
    this.currentUser.set(sesion);
  }

  private obtenerUsuarioInicial(): UsuarioSesion | null {
    try {
      const data = localStorage.getItem('usuario');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
}
