import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { InicioComponent } from './paginas/inicio/inicio';
import { LoginComponent } from './paginas/login/login';
import { EspecialidadesPublicaComponent } from './paginas/especialidades-publica/especialidades-publica';
import { EspecialidadesAdminComponent } from './paginas/especialidades-admin/especialidades-admin';
import { SolicitarTurnoComponent } from './paginas/solicitar-turno/solicitar-turno';
import { DiasAtencionComponent } from './paginas/dias-atencion-admin/dias-atencion';
import { PacientesPorMedicoComponent } from './paginas/pacientes-por-medico-admin/pacientes-por-medico';
import { TurnosAdminComponent } from './paginas/turnos-admin/turnos-admin';
import { DashboardAdminComponent } from './paginas/dashboard-admin/dashboard-admin';
import { ObrasSocialesAdminComponent } from './paginas/obras-sociales-admin/obras-sociales-admin';

export const routes: Routes = [
  // RUTAS PÚBLICAS
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: InicioComponent },
      { path: 'login', component: LoginComponent },
      { path: 'especialidades', component: EspecialidadesPublicaComponent },
      { path: 'turnos/solicitar', component: SolicitarTurnoComponent },
      { path: 'dias-atencion', component: DiasAtencionComponent },
    ]
  },

  // RUTAS ADMINISTRATIVAS (Todas las que el Sidebar busca bajo /admin)
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: '', component: DashboardAdminComponent },
      { path: 'especialidades', component: EspecialidadesAdminComponent },
      { path: 'pacientes-por-medico', component: PacientesPorMedicoComponent },
      { path: 'turnos', component: TurnosAdminComponent },
      { path: 'obras-sociales', component: ObrasSocialesAdminComponent}
    ]
  },

  { path: '**', redirectTo: '' }
];