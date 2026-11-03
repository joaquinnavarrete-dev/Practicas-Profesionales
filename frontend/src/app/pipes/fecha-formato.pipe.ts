import { Pipe, PipeTransform } from '@angular/core';
import { formatearFecha, FormatoFecha } from '../utils/date.utils';

@Pipe({
  name: 'fechaFormato',
  standalone: true
})
export class FechaFormatoPipe implements PipeTransform {
  transform(value: string | Date | null | undefined, formato: FormatoFecha = 'corta'): string {
    return formatearFecha(value, formato);
  }
}

