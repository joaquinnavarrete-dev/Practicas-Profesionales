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

export interface Toast {
  id: number;
  tipo: 'success' | 'error' | 'warning' | 'info';
  titulo?: string;
  mensaje: string;
  duracion?: number;
}
