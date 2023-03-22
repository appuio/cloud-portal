import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { mergeMap, Observable, of, retry, timer } from 'rxjs';

@Injectable()
export class RetryInterceptor implements HttpInterceptor {
  readonly MAX_RETRIES = 2;
  readonly BASE_DELAY = 500;

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.method === 'GET') {
      return next.handle(request).pipe(
        retry({
          count: this.MAX_RETRIES,
          delay: (error) => {
            return of(error).pipe(
              mergeMap((err: HttpErrorResponse, retryCount) => {
                const ignoreStatus = err.status >= 400 && err.status < 500;
                if (retryCount >= this.MAX_RETRIES || ignoreStatus) {
                  throw err;
                }
                const delayTime = this.BASE_DELAY * (retryCount + 1);
                return timer(delayTime);
              })
            );
          },
        })
      );
    }
    return next.handle(request);
  }
}
