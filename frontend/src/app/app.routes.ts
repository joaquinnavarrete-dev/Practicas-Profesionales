import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { InicioComponent } from './paginas/inicio/inicio';
import {LoginComponent} from './paginas/login/login';
import {EspecialidadesPublicaComponent} from './paginas/especialidades-publica/especialidades-publica';
import {EspecialidadesAdminComponent} from './paginas/especialidades-admin/especialidades-admin';

export const routes: Routes = [
  // RUTAS PÚBLICAS (Navbar + Footer)
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: InicioComponent }, // La Home / Index activa
      { path: 'login', component: LoginComponent }, //ruta activa para el login
      { path: 'especialidades', component: EspecialidadesPublicaComponent },
      // { path: 'registro', component: RegistroComponent },
    ]
  },

  // RUTAS ADMINISTRATIVAS (Sidebar)
  {
    path: 'admin',
    component: AdminLayout,
    children: [
       { path: 'especialidades', component: EspecialidadesAdminComponent },
      // { path: 'medicos', component: MedicosComponent },
      // { path: 'especialidades', component: EspecialidadesComponent },
      // { path: 'obras-sociales', component: ObrasSocialesComponent },
    ]
  },

  // Redirección por defecto ante rutas desconocidas
  { path: '**', redirectTo: '' }
];