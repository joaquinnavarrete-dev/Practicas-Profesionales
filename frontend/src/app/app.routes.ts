import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

export const routes: Routes = [
  // RUTAS PÚBLICAS (Se renderizan con Navbar y Footer)
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      // { path: '', component: InicioComponent },
      // { path: 'login', component: LoginComponent },
      // { path: 'registro', component: RegistroComponent },
    ]
  },

  // RUTAS ADMINISTRATIVAS (Se renderizan con Sidebar)
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      // { path: 'dashboard', component: DashboardComponent },
      // { path: 'medicos', component: MedicosComponent },
      // { path: 'especialidades', component: EspecialidadesComponent },
      // { path: 'obras-sociales', component: ObrasSocialesComponent },
    ]
  },

  // Redirección por defecto
  { path: '**', redirectTo: '' }
];