import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { AuthConfig, OAuthModule, OAuthService } from 'angular-oauth2-oidc';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NavbarItemComponent } from './navbar-item/navbar-item.component';
import { AppConfigService } from './app-config.service';
import { forkJoin, mergeMap, Observable, retry } from 'rxjs';
import { ZonesComponent } from './zones/zones.component';
import { IdTokenInterceptor } from './core/id-token.interceptor';
import { Store, StoreModule } from '@ngrx/store';
import { appReducer } from './store/app.reducer';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { AppEffects } from './store/app.effects';
import { MessageService } from 'primeng/api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { KubernetesClientService } from './core/kubernetes-client.service';
import { setPermission } from './store/app.actions';
import { routerReducer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { SharedModule } from './shared/shared.module';
import * as Sentry from '@sentry/angular';

@NgModule({
  declarations: [AppComponent, NavbarItemComponent, ZonesComponent, HomeComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    AppRoutingModule,
    HttpClientModule,
    OAuthModule.forRoot(),
    StoreModule.forRoot({ app: appReducer, router: routerReducer }),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    EffectsModule.forRoot([AppEffects]),
    StoreRouterConnectingModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      deps: [AppConfigService, OAuthService, KubernetesClientService, Store],
      useFactory: initializeAppFactory,
      multi: true,
    },
    { provide: HTTP_INTERCEPTORS, useClass: IdTokenInterceptor, multi: true },
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: true,
        logErrors: true,
      }),
    },
    MessageService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

export function initializeAppFactory(
  appConfigService: AppConfigService,
  oauthService: OAuthService,
  kubernetesClientService: KubernetesClientService,
  store: Store
): () => Observable<boolean> {
  return () => {
    return appConfigService.loadConfig().pipe(
      mergeMap((appConfig) => {
        const authConfig = {
          ...authCodeFlowConfig,
          issuer: appConfig.issuer,
          clientId: appConfig.clientId,
        };
        oauthService.configure(authConfig);
        return oauthService.loadDiscoveryDocumentAndLogin().then((loggedIn) => {
          if (!loggedIn) {
            return Promise.reject('Not logged in');
          }
          oauthService.setupAutomaticSilentRefresh();

          return new Promise<boolean>((resolve) => {
            forkJoin([kubernetesClientService.getZonePermission(), kubernetesClientService.getOrganizationPermission()])
              .pipe(retry({ count: 5, delay: 500 }))
              .subscribe({
                next: ([zones, organizations]) => {
                  store.dispatch(setPermission({ permission: { zones, organizations } }));
                  resolve(true);
                },
                error: () => {
                  resolve(true);
                },
              });
          });
        });
      })
    );
  };
}

export const authCodeFlowConfig: AuthConfig = {
  redirectUri: window.location.origin + '/index.html',
  responseType: 'code',
  scope: 'openid profile email roles offline_access web-origins',
  showDebugInformation: !environment.production,
};
