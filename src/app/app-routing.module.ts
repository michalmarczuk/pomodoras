import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './pages/auth/auth.component';
import { AuthGuardService } from './pages/auth/auth.guard.service';
import { ReportsComponent } from './pages/reports/reports.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { TimerComponent } from './pages/timer/timer.component';

const routes: Routes = [
  { path: '', component: AuthComponent, canActivate: [AuthGuardService] },
  { path: 'timer', component: TimerComponent, canActivate: [AuthGuardService] },
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuardService] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuardService] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
