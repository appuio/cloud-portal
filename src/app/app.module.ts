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
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {NavbarItemComponent} from './navbar-item/navbar-item.component';
import {AppConfigService} from "./app-config.service";
import {mergeMap, Observable} from "rxjs";
import {ZonesComponent} from './zones/zones.component';
import {IdTokenInterceptor} from "./id-token.interceptor";

@NgModule({
  declarations: [
    AppComponent,
    NavbarItemComponent,
    ZonesComponent
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
      deps: [AppConfigService, OAuthService],
      useFactory: initializeAppFactory,
      multi: true
    },
    {provide: HTTP_INTERCEPTORS, useClass: IdTokenInterceptor, multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

export function initializeAppFactory(appConfigService: AppConfigService, oauthService: OAuthService): () => Observable<boolean> {
  return () => {
    return appConfigService.loadConfig()
      .pipe(mergeMap(appConfig => {
        const authConfig = {
          ...authCodeFlowConfig,
          issuer: appConfig.issuer,
          clientId: appConfig.clientId
        };
        oauthService.configure(authConfig);
        return oauthService.loadDiscoveryDocumentAndLogin().then(loggedIn => {
          if (!loggedIn) {
            return Promise.reject("Not logged in");
          }
          oauthService.setupAutomaticSilentRefresh();
          return true;
        });

      }));
  };
}


export const authCodeFlowConfig: AuthConfig = {
  redirectUri: window.location.origin + '/index.html',
  responseType: 'code',
  scope: 'openid profile email roles offline_access web-origins',
  showDebugInformation: !environment.production,
};
