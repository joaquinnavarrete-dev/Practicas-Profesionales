import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { InicioComponent } from './paginas/inicio/inicio';

export const routes: Routes = [
  // RUTAS PÚBLICAS (Navbar + Footer)
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: InicioComponent }, // La Home / Index activa
      // { path: 'login', component: LoginComponent },
      // { path: 'registro', component: RegistroComponent },
    ]
  },

  // RUTAS ADMINISTRATIVAS (Sidebar)
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

  // Redirección por defecto ante rutas desconocidas
  { path: '**', redirectTo: '' }
];