import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cobertura',
  standalone: true
})
export class CoberturaPipe implements PipeTransform {
  transform(value: { nombre?: string; sigla?: string } | string | null | undefined): string {
    if (!value) return 'Particular';

    if (typeof value === 'string') {
      const limpia = value.trim();
      const lower = limpia.toLowerCase();
      if (!limpia || lower.includes('particular') || lower.includes('ningun') || lower.includes('sin obra')) {
        return 'Particular';
      }
      if (limpia.length <= 16) {
        return limpia;
      }
      const matchParen = limpia.match(/\(([^)]+)\)/);
      if (matchParen && matchParen[1].length <= 15) {
        return matchParen[1].trim();
      }
      return 'Cubierto';
    }

    const nombre = value.nombre?.trim() || '';
    const lower = nombre.toLowerCase();
    if (!nombre || lower.includes('particular') || lower.includes('ningun') || lower.includes('sin obra')) {
      return 'Particular';
    }

    if (value.sigla && value.sigla.trim()) {
      return value.sigla.trim();
    }

    if (nombre.length <= 16) {
      return nombre;
    }

    const matchParen = nombre.match(/\(([^)]+)\)/);
    if (matchParen && matchParen[1].length <= 15) {
      return matchParen[1].trim();
    }

    return 'Cubierto';
  }
}

