import { Component, inject, computed, signal, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EmpresaService } from '../../services';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class InicioComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly empresaService = inject(EmpresaService);

  readonly nombreEmpresa = signal<string>('');

  readonly mostrarBotonArriba = signal(false);

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const yOffset = window.pageYOffset || document.documentElement.scrollTop || 0;
    this.mostrarBotonArriba.set(yOffset > 300);
  }

  ngOnInit(): void {
    this.empresaService.listar().subscribe({
      next: (empresas) => {
        if (empresas.length > 0) {
          this.nombreEmpresa.set(empresas[0].nombre);
        }
      }
    });
  }

  volverArriba(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  readonly esPersonalClinico = computed(() =>
    this.authService.isAdmin() || this.authService.isMedico() || this.authService.isRecepcionista()
  );

  readonly esPaciente = computed(() =>
    this.authService.isLoggedIn() && !this.esPersonalClinico()
  );
}
