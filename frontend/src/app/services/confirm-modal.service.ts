import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  titulo?: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  tipo?: 'danger' | 'warning' | 'info';
}

export interface ConfirmModalState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmModalService {
  readonly state = signal<ConfirmModalState | null>(null);

  confirm(options: ConfirmOptions | string): Promise<boolean> {
    const config: ConfirmOptions = typeof options === 'string'
      ? { mensaje: options, titulo: 'Confirmar Acción', tipo: 'warning' }
      : {
        titulo: options.titulo || 'Confirmar Acción',
        mensaje: options.mensaje,
        textoConfirmar: options.textoConfirmar || 'Confirmar',
        textoCancelar: options.textoCancelar || 'Cancelar',
        tipo: options.tipo || 'warning'
      };

    return new Promise<boolean>((resolve) => {
      this.state.set({
        ...config,
        resolve
      });
    });
  }

  aceptar(): void {
    const actual = this.state();
    if (actual) {
      actual.resolve(true);
      this.state.set(null);
    }
  }

  cancelar(): void {
    const actual = this.state();
    if (actual) {
      actual.resolve(false);
      this.state.set(null);
    }
  }
}

