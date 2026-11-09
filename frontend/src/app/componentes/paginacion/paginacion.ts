import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-paginacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paginacion.html',
  styleUrl: './paginacion.css'
})
export class PaginacionComponent {
  readonly totalItems = input<number>(0);
  readonly paginaActual = input<number>(1);
  readonly tamanoPagina = input<number>(10);
  readonly opcionesTamano = input<number[]>([10, 15, 25, 50]);

  readonly cambioPagina = output<number>();
  readonly cambioTamano = output<number>();

  readonly totalPaginas = computed<number>(() => {
    return Math.ceil(this.totalItems() / this.tamanoPagina()) || 1;
  });

  readonly desde = computed<number>(() => {
    if (this.totalItems() === 0) return 0;
    return (this.paginaActual() - 1) * this.tamanoPagina() + 1;
  });

  readonly hasta = computed<number>(() => {
    return Math.min(this.paginaActual() * this.tamanoPagina(), this.totalItems());
  });

  readonly paginasVisibles = computed<(number | string)[]>(() => {
    const total = this.totalPaginas();
    const actual = this.paginaActual();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (actual <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }

    if (actual >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, '...', actual - 1, actual, actual + 1, '...', total];
  });

  irAPagina(p: number | string): void {
    if (typeof p === 'number' && p >= 1 && p <= this.totalPaginas() && p !== this.paginaActual()) {
      this.cambioPagina.emit(p);
    }
  }

  anterior(): void {
    if (this.paginaActual() > 1) {
      this.cambioPagina.emit(this.paginaActual() - 1);
    }
  }

  siguiente(): void {
    if (this.paginaActual() < this.totalPaginas()) {
      this.cambioPagina.emit(this.paginaActual() + 1);
    }
  }

  onCambiarTamano(val: any): void {
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      this.cambioTamano.emit(num);
      this.cambioPagina.emit(1);
    }
  }
}

