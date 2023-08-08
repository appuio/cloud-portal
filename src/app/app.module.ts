import { APP_INITIALIZER, ErrorHandler, inject, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { AuthConfig, OAuthModule, OAuthService } from 'angular-oauth2-oidc';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NavbarItemComponent } from './navbar-item/navbar-item.component';
import { AppConfigService } from './app-config.service';
import { mergeMap, Observable } from 'rxjs';
import { IdTokenInterceptor } from './core/id-token.interceptor';
import { StoreModule } from '@ngrx/store';
import { appReducer } from './store/app.reducer';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { AppEffects } from './store/app.effects';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { routerReducer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { SharedModule } from './shared/shared.module';
import * as Sentry from '@sentry/angular-ivy';
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
import { DefaultDataServiceFactory, EntityDataModule, EntityDataService, EntityDefinitionService } from '@ngrx/data';
import { entityConfig, entityMetadataMap, selfSubjectAccessReviewEntityKey } from './store/entity-metadata-map';
import { SelfSubjectAccessReviewDataService } from './store/ssar-data.service';
import { OrganizationCollectionService } from './store/organization-collection.service';
import { KubernetesDataServiceFactory } from './store/kubernetes-data.service';
import { KubernetesCollectionServiceFactory } from './store/kubernetes-collection.service';
import { SelfSubjectAccessReviewCollectionService } from './store/ssar-collection.service';
import { NavigationService } from './shared/navigation.service';
import { invitationTokenLocalStorageKey } from './types/invitation';
import { BrowserStorageService } from './shared/browser-storage.service';
import { JoinDialogComponent } from './join-dialog/join-dialog.component';

@NgModule({
    declarations: [AppComponent],
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
        EntityDataModule.forRoot(entityConfig),
        NavbarItemComponent,
        HomeComponent,
        StatusBadgeComponent,
        FirstTimeLoginDialogComponent,
        OrganizationSelectionComponent,
        IdentityMenuComponent,
        InfoMenuComponent,
        InfoMenuItemComponent,
        JoinDialogComponent,
    ],
    providers: [
        MessageService,
        DialogService,
        ConfirmationService,
        OrganizationCollectionService,
        KubernetesCollectionServiceFactory,
        SelfSubjectAccessReviewCollectionService,
        {
            provide: APP_INITIALIZER,
            // start the NavigationService early to catch route events.
            deps: [AppConfigService, OAuthService, BrowserStorageService, NavigationService],
            useFactory: initializeAppFactory,
            multi: true,
        },
        { provide: HTTP_INTERCEPTORS, useClass: IdTokenInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: RetryInterceptor, multi: true },
        { provide: DefaultDataServiceFactory, useClass: KubernetesDataServiceFactory },
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
export class AppModule {
  constructor(entityDefinitionService: EntityDefinitionService, entityDataService: EntityDataService) {
    entityDefinitionService.registerMetadataMap(entityMetadataMap);
    entityDataService.registerService(selfSubjectAccessReviewEntityKey, inject(SelfSubjectAccessReviewDataService));
  }
}

export function initializeAppFactory(
  appConfigService: AppConfigService,
  oauthService: OAuthService,
  storageService: BrowserStorageService
): () => Observable<boolean> {
  return () => {
    return appConfigService.loadConfig().pipe(
      mergeMap((appConfig) => {
        const tokenInQuery = new URLSearchParams(window.location.search).get('token');
        if (tokenInQuery) {
          // store the token in local storage for later. Somehow oauth redirect with query params doesn't work.
          if (!storageService.setLocalStorageItem(invitationTokenLocalStorageKey, tokenInQuery)) {
            console.warn(
              'could not store the invitation token in browsers local storage. The invitation redeem might not work correctly or only via query parameters.'
            );
          }
        }
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
          return true;
        });
      })
    );
  };
}

export const authCodeFlowConfig: AuthConfig = {
  redirectUri: window.location.origin + window.location.pathname,
  responseType: 'code',
  scope: 'openid profile email roles offline_access web-origins',
};
