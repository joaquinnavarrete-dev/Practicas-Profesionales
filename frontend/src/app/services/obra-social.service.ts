import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ObraSocialService {
  private apiUrl = 'http://localhost:8080/api/obras-sociales';

  constructor(private http: HttpClient) {}

  listarObrasSociales(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}