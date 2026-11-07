export interface ObraSocial {
  idObraSocial: number;
  nombre: string;
  sigla?: string;
}

export interface ObraSocialRequest {
  nombre: string;
}

export interface ObraSocialItem {
  id: number;
  nombre: string;
  sigla: string;
  tipo: 'Prepaga' | 'Obra Social' | 'Sindical';
  codigoRns: string;
  planesAdmitidos: string;
  copagoSugerido: string;
  estado: 'Activa' | 'En Revisión' | 'Suspendida';
  logoUrl: string;
}
