import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EmpresaService } from '../../services';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {

  readonly authService = inject(AuthService);
  readonly empresaService = inject(EmpresaService);
  readonly menuMovilAbierto = signal<boolean>(false);

  readonly nombreEmpresa = signal<string>('');
  readonly rubroEmpresa = signal<string>('');

  readonly esPersonalClinico = computed(() =>
    this.authService.isAdmin() || this.authService.isMedico() || this.authService.isRecepcionista()
  );

  readonly esPaciente = computed(() =>
    this.authService.isLoggedIn() && !this.esPersonalClinico()
  );

  readonly rutaInicioBrand = computed(() => {
    if (!this.authService.isLoggedIn()) return '/';
    if (this.esPaciente()) return '/mi-portal';
    return '/admin';
  });

  ngOnInit(): void {
    this.empresaService.listar().subscribe({
      next: (empresas) => {
        if (empresas && empresas.length > 0) {
          this.nombreEmpresa.set(empresas[0].nombre);
          this.rubroEmpresa.set(empresas[0].rubro);
        }
      }
    });
  }

  toggleMenuMovil(): void {
    this.menuMovilAbierto.update(v => !v);
  }

  cerrarMenuMovil(): void {
    this.menuMovilAbierto.set(false);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.cerrarMenuMovil();
  }
}
