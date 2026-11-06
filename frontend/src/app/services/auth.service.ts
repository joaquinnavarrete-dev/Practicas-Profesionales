import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Ajustá la URL según el endpoint de login que tenga tu Spring Boot
  private apiUrl = 'http://localhost:8080/api/usuarios/login'; 

  constructor(private http: HttpClient) {}

  login(credenciales: { nombreUsuario: string; contrasena: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, credenciales);
  }
}