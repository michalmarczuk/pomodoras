import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthComponent } from './pages/auth/auth.component';
import { BackendService } from './services/backend.service';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import { HeaderComponent } from './shared/header/header.component';
import { TimerComponent } from './pages/timer/timer.component';
import { AuthInterceptorService } from './pages/auth/auth.interceptor.service';
import { AuthGuardService } from './pages/auth/auth.guard.service';
import { ReportsComponent } from './pages/reports/reports.component';
import { SettingsComponent } from './pages/settings/settings.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    SpinnerComponent,
    HeaderComponent,
    TimerComponent,
    ReportsComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule, 
    ReactiveFormsModule,
    HttpClientModule,
    DragDropModule
  ],
  providers: [
    BackendService,
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true},
    AuthGuardService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
