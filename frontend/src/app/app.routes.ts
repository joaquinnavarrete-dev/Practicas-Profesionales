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
import { PacientesAdminComponent } from './paginas/pacientes-admin/pacientes-admin';
import { MedicosAdminComponent } from './paginas/medicos-admin/medicos-admin';
import { UsuariosAdminComponent } from './paginas/usuarios-admin/usuarios-admin';
import { RolesAdminComponent } from './paginas/roles-admin/roles-admin';
import { RegistrarUsuarioAdminComponent } from './paginas/registrar-usuario-admin/registrar-usuario-admin';
import { RegistrarMedicoAdminComponent } from './paginas/registrar-medico-admin/registrar-medico-admin';
import { EditarMedicoAdminComponent } from './paginas/editar-medico-admin/editar-medico-admin';
import { RegistrarPacientePublicoComponent } from './paginas/registrar-paciente-publico/registrar-paciente-publico';
import { RegistrarObraSocialAdminComponent } from './paginas/registrar-obra-social-admin/registrar-obra-social-admin';
import { RegistrarEspecialidadAdminComponent } from './paginas/registrar-especialidad-admin/registrar-especialidad-admin';
import { EditarEspecialidadAdminComponent } from './paginas/editar-especialidad-admin/editar-especialidad-admin';

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
      { path: 'registro', component: RegistrarPacientePublicoComponent },
      { path: 'paciente/registrar', component: RegistrarPacientePublicoComponent }
      
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
      { path: 'obras-sociales', component: ObrasSocialesAdminComponent},
      { path:'pacientes', component: PacientesAdminComponent},
      { path: 'medicos', component: MedicosAdminComponent },
      { path: 'usuarios', component: UsuariosAdminComponent},
      { path: 'usuarios/roles', component: RolesAdminComponent },
      { path: 'dias-atencion', component: DiasAtencionComponent },
      { path: 'usuarios/roles/:id', component: RolesAdminComponent },
      { path: 'usuarios/nuevo', component: RegistrarUsuarioAdminComponent },
      { path: 'medicos/nuevo', component: RegistrarMedicoAdminComponent },
      { path: 'medicos/editar/:id',component: EditarMedicoAdminComponent },
      { path: 'obras-sociales/nuevo', component:RegistrarObraSocialAdminComponent },
      { path: 'especialidades/nuevo', component: RegistrarEspecialidadAdminComponent },
      { path: 'especialidades/editar/:id', component: EditarEspecialidadAdminComponent },


    ]
  },

  { path: '**', redirectTo: '' }
];