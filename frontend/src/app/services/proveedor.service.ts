import { Injectable, Inject, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Proveedor, ProveedorRequest } from '../models';

@Injectable({
    providedIn: 'root'
})
export class ProveedorService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/proveedores`;

    listar(): Observable<Proveedor[]> {
        return this.http.get<Proveedor[]>(this.apiUrl);
    }

    obtenerPorId(id: number): Observable<Proveedor> {
        return this.http.get<Proveedor>(`${this.apiUrl}/${id}`);
    }

    crear(proveedor: ProveedorRequest): Observable<Proveedor> {
        return this.http.post<Proveedor>(this.apiUrl, proveedor);
    }

    actualizar(id: number, proveedor: ProveedorRequest): Observable<Proveedor> {
        return this.http.put<Proveedor>(`${this.apiUrl}/${id}`, proveedor);
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    cambiarEstado(id: number, estado: string): Observable<Proveedor> {
        const params = new HttpParams().set('Activo', estado.toString());
        return this.http.patch<Proveedor>(`${this.apiUrl}/${id}/estado`, {}, { params });
    }
}
