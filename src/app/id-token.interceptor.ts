import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable()
export class IdTokenInterceptor implements HttpInterceptor {
  constructor(private oAuthService: OAuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (request.url.startsWith('appuio-api')) {
      return next.handle(
        request.clone({
          headers: request.headers.set(
            'Authorization',
            `Bearer ${this.oAuthService.getIdToken()}`
          ),
        })
      );
    }
    return next.handle(request);
  }
}
