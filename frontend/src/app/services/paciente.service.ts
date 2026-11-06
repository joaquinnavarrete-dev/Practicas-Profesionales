import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private apiUrl = 'http://localhost:8080/api/pacientes';

  constructor(private http: HttpClient) {}

  registrarPaciente(dto: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, dto);
  }
}