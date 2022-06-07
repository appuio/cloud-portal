import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { delay, Observable, of, retry } from 'rxjs';

@Injectable()
export class RetryInterceptor implements HttpInterceptor {
  readonly MAX_RETRIES = 2;
  readonly BASE_DELAY = 500;

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.method === 'GET') {
      return next.handle(request).pipe(
        retry({
          count: this.MAX_RETRIES,
          delay: (error, retryCount) => of(error).pipe(delay(this.BASE_DELAY * (retryCount - 1))),
        })
      );
    }
    return next.handle(request);
  }
}
