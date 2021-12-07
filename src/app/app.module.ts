import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ButtonModule} from "primeng/button";
import {StyleClassModule} from "primeng/styleclass";
import {RippleModule} from "primeng/ripple";
import {InputTextModule} from "primeng/inputtext";
import {BadgeModule} from "primeng/badge";
import {StoreModule} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {environment} from '../environments/environment';
import {AuthConfig, OAuthModule, OAuthService} from 'angular-oauth2-oidc';
import {HttpClientModule} from "@angular/common/http";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StyleClassModule,
    ButtonModule,
    RippleModule,
    InputTextModule,
    BadgeModule,
    HttpClientModule,
    StoreModule.forRoot({}, {}),
    StoreDevtoolsModule.instrument({maxAge: 25, logOnly: environment.production}),
    OAuthModule.forRoot()
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      deps: [OAuthService],
      useFactory: initializeAppFactory,
      multi: true
    }],
  bootstrap: [AppComponent]
})
export class AppModule {
}

export function initializeAppFactory(oauthService: OAuthService): () => Promise<boolean> {
  return () => {
    oauthService.configure(authCodeFlowConfig);
    return oauthService.loadDiscoveryDocumentAndLogin().then(loggedIn => {
      if (loggedIn) {
        oauthService.setupAutomaticSilentRefresh();
        return loggedIn;
      }
      return Promise.reject("Not logged in");
    });
  };
}


export const authCodeFlowConfig: AuthConfig = {
  issuer: 'http://localhost:8080/auth/realms/appuio',
  redirectUri: window.location.origin + '/index.html',
  clientId: 'appuio-cloud-portal',
  responseType: 'code',
  scope: 'openid profile email',
  showDebugInformation: !environment.production,
};
