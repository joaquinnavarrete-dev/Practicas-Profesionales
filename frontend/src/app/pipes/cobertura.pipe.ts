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
      return limpia;
    }

    const nombre = value.nombre?.trim() || '';
    const lower = nombre.toLowerCase();
    if (!nombre || lower.includes('particular') || lower.includes('ningun') || lower.includes('sin obra')) {
      return 'Particular';
    }

    if (value.sigla && value.sigla.trim()) {
      return value.sigla.trim();
    }

    return 'Cubierto';
  }
}

