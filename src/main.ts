import { enableProdMode, APP_INITIALIZER, ErrorHandler, inject, ENVIRONMENT_INITIALIZER } from '@angular/core';
import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { entityConfig, selfSubjectAccessReviewEntityKey } from './app/store/entity-metadata-map';
import { AppEffects } from './app/store/app.effects';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { appReducer } from './app/store/app.reducer';
import { provideStore } from '@ngrx/store';
import { provideAnimations } from '@angular/platform-browser/animations';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppAndPageTitleStrategy } from './app/title-strategy';
import { provideRouter, TitleStrategy } from '@angular/router';
import { KubernetesDataServiceFactory } from './app/store/kubernetes-data.service';
import { DefaultDataServiceFactory, EntityDataService, provideEntityData, withEffects } from '@ngrx/data';
import { RetryInterceptor } from './app/core/retry.interceptor';
import { IdTokenInterceptor } from './app/core/id-token.interceptor';
import { HTTP_INTERCEPTORS, withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { NavigationService } from './app/shared/navigation.service';
import { invitationTokenLocalStorageKey } from './app/types/invitation';
import { Observable, mergeMap } from 'rxjs';
import { BrowserStorageService } from './app/shared/browser-storage.service';
import { OAuthService, AuthConfig, provideOAuthClient } from 'angular-oauth2-oidc';
import { AppConfigService } from './app/app-config.service';
import { SelfSubjectAccessReviewCollectionService } from './app/store/ssar-collection.service';
import { KubernetesCollectionServiceFactory } from './app/store/kubernetes-collection.service';
import { OrganizationCollectionService } from './app/store/organization-collection.service';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import * as Sentry from '@sentry/angular-ivy';
import { SelfSubjectAccessReviewDataService } from './app/store/ssar-data.service';
import { appRoutes } from './app/app.routing';

const authCodeFlowConfig: AuthConfig = {
  redirectUri: window.location.origin + window.location.pathname,
  responseType: 'code',
  scope: 'openid profile email roles offline_access web-origins',
};

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    MessageService,
    DialogService,
    ConfirmationService,
    OrganizationCollectionService,
    KubernetesCollectionServiceFactory,
    EntityDataService,
    SelfSubjectAccessReviewCollectionService,
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideStore({ app: appReducer, router: routerReducer }),
    provideRouterStore(),
    provideEffects([AppEffects]),
    provideEntityData(entityConfig, withEffects()),
    provideOAuthClient(),
    provideRouter(appRoutes),
    { provide: HTTP_INTERCEPTORS, useClass: IdTokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: RetryInterceptor, multi: true },
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: true,
        logErrors: true,
      }),
    },
    { provide: DefaultDataServiceFactory, useClass: KubernetesDataServiceFactory },
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue() {
        const entityDataService = inject(EntityDataService);
        entityDataService.registerService(selfSubjectAccessReviewEntityKey, inject(SelfSubjectAccessReviewDataService));
      },
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      // start the NavigationService early to catch route events.
      deps: [AppConfigService, OAuthService, BrowserStorageService, NavigationService],
      useFactory: initializeAppFactory,
      multi: true,
    },
    { provide: TitleStrategy, useClass: AppAndPageTitleStrategy },
    ...environment.environmentSpecificModules,
  ],
}).catch((err) => console.error(err));

function initializeAppFactory(
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
