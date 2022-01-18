import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ButtonModule} from "primeng/button";
import {StyleClassModule} from "primeng/styleclass";
import {RippleModule} from "primeng/ripple";
import {InputTextModule} from "primeng/inputtext";
import {BadgeModule} from "primeng/badge";
import {environment} from '../environments/environment';
import {AuthConfig, OAuthModule, OAuthService} from 'angular-oauth2-oidc';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {NavbarItemComponent} from './navbar-item/navbar-item.component';
import {AppConfigService} from "./app-config.service";
import {mergeMap, Observable} from "rxjs";
import {ZonesComponent} from './zones/zones.component';
import {IdTokenInterceptor} from "./id-token.interceptor";
import {ReactiveComponentModule} from "@ngrx/component";
import {TagModule} from "primeng/tag";
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {ClipboardModule} from "@angular/cdk/clipboard";
import {StoreModule} from '@ngrx/store';
import {appReducer} from './store/app.reducer';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {EffectsModule} from '@ngrx/effects';
import {AppEffects} from './store/app.effects';

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
    OAuthModule.forRoot(),
    ReactiveComponentModule,
    TagModule,
    FontAwesomeModule,
    ClipboardModule,
    StoreModule.forRoot({app: appReducer}),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    EffectsModule.forRoot([AppEffects])
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
