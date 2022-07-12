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
import { IdTokenInterceptor } from './core/id-token.interceptor';
import { Store, StoreModule } from '@ngrx/store';
import { appReducer } from './store/app.reducer';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { AppEffects } from './store/app.effects';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { KubernetesClientService } from './core/kubernetes-client.service';
import { setPermission } from './store/app.actions';
import { routerReducer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { SharedModule } from './shared/shared.module';
import * as Sentry from '@sentry/angular';
import { StatusBadgeComponent } from './status-badge/status-badge.component';
import { FirstTimeLoginDialogComponent } from './first-time-login-dialog/first-time-login-dialog.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { OrganizationSelectionComponent } from './organization-selection/organization-selection.component';
import { IdentityMenuComponent } from './identity-menu/identity-menu.component';
import { InfoMenuComponent } from './info-menu/info-menu.component';
import { InfoMenuItemComponent } from './info-menu-item/info-menu-item.component';
import { RetryInterceptor } from './core/retry.interceptor';
import { TitleStrategy } from '@angular/router';
import { AppAndPageTitleStrategy } from './title-strategy';

@NgModule({
  declarations: [
    AppComponent,
    NavbarItemComponent,
    HomeComponent,
    StatusBadgeComponent,
    FirstTimeLoginDialogComponent,
    OrganizationSelectionComponent,
    IdentityMenuComponent,
    InfoMenuComponent,
    InfoMenuItemComponent,
  ],
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
    MessageService,
    DialogService,
    ConfirmationService,
    {
      provide: APP_INITIALIZER,
      deps: [AppConfigService, OAuthService, KubernetesClientService, Store],
      useFactory: initializeAppFactory,
      multi: true,
    },
    { provide: HTTP_INTERCEPTORS, useClass: IdTokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: RetryInterceptor, multi: true },
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: true,
        logErrors: true,
      }),
    },
    { provide: TitleStrategy, useClass: AppAndPageTitleStrategy },
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
            forkJoin([
              kubernetesClientService.getZonePermission(),
              kubernetesClientService.getOrganizationsPermission(),
            ])
              .pipe(retry({ count: 1, delay: 250 }))
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
  redirectUri: window.location.origin + window.location.pathname,
  responseType: 'code',
  scope: 'openid profile email roles offline_access web-origins',
  showDebugInformation: !environment.production,
};
