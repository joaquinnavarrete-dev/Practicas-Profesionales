import { Pipe, PipeTransform } from '@angular/core';
import { formatearHora } from '../utils/date.utils';

@Pipe({
  name: 'horaFormato',
  standalone: true
})
export class HoraFormatoPipe implements PipeTransform {
  transform(value: string | null | undefined, incluirHs: boolean = true): string {
    return formatearHora(value, incluirHs);
  }
}

