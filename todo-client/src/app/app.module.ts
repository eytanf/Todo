import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule   } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtModule } from '@auth0/angular-jwt';
import { CommonModule } from '@angular/common';
import { AuthGuardService as AuthGuard } from './auth/auth-guard.service';
import { CookieService } from 'ngx-cookie-service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxYoutubePlayerModule } from 'ngx-youtube-player';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatButtonModule , 
  MatToolbarModule,
  MatInputModule, 
  MatTableModule, 
  MatPaginatorModule,
  MatSortModule ,
  MatDialogModule,
  MatCheckboxModule,
  MatIconModule,
  MatFormFieldModule,
  MatTooltipModule,
  MatSidenavModule,
 } from '@angular/material';


import { AppComponent } from './app.component';
import { AppRoutingModule  , routingComponents} from './app-routing.module';

import { IssueService } from './issue.service';
import { TaskService } from './task.service';
import { AuthService } from './auth/auth.service';
import { AuthGuardService } from './auth/auth-guard.service';

export function tokenGetter() {
  return localStorage.getItem('token');
}

@NgModule({
  declarations: [
    AppComponent,
    routingComponents[0],
    routingComponents[1]
  ],
  imports: [
    NgbModule,
    FlexLayoutModule,
    ReactiveFormsModule ,
    NgxYoutubePlayerModule,
    MatSidenavModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatInputModule, 
    MatTableModule, 
    MatPaginatorModule,
    MatIconModule,
    MatSortModule ,
    MatDialogModule,
    MatFormFieldModule,
    MatButtonModule,
    MatToolbarModule,
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatIconModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        whitelistedDomains: [],
        blacklistedRoutes: []
      }
    })
  ],
  providers: [TaskService, IssueService , routingComponents[1] , AuthGuard , AuthService , AuthGuardService , CookieService ],
  bootstrap: [AppComponent]
})
export class AppModule { }

