import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  tipo: 'success' | 'error' | 'warning' | 'info';
  titulo?: string;
  mensaje: string;
  duracion?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private contadorId = 0;
  readonly toasts = signal<Toast[]>([]);

  show(tipo: 'success' | 'error' | 'warning' | 'info', mensaje: string, titulo?: string, duracion = 4000): void {
    const id = ++this.contadorId;
    const nuevoToast: Toast = {
      id,
      tipo,
      titulo,
      mensaje,
      duracion
    };

    this.toasts.update(lista => [...lista, nuevoToast]);

    if (duracion > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duracion);
    }
  }

  success(mensaje: string, titulo = 'Operación Exitosa'): void {
    this.show('success', mensaje, titulo);
  }

  error(mensaje: string, titulo = 'Error'): void {
    this.show('error', mensaje, titulo, 6000);
  }

  warning(mensaje: string, titulo = 'Atención'): void {
    this.show('warning', mensaje, titulo, 5000);
  }

  info(mensaje: string, titulo = 'Información'): void {
    this.show('info', mensaje, titulo);
  }

  remove(id: number): void {
    this.toasts.update(lista => lista.filter(t => t.id !== id));
  }
}

