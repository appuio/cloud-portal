import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

/**
 * Inspired by https://nils-mehlhorn.de/posts/angular-navigate-back-previous-page/
 * Modified to be used with a Router working with default and relative paths in case the history is empty.
 */
@Injectable({ providedIn: 'root' })
export class NavigationService {
  private history: string[] = [];

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.history.push(event.urlAfterRedirects);
        this.history.splice(0, this.history.length - 5); // only keep the latest few, no need for more.
      }
    });
  }

  /**
   * Gets the previous URI location in the history.
   * @param defaultPath if the history is empty, return this path as fallback value
   * @returns the URI, or '/' if no default was given.
   */
  previousLocation(defaultPath?: string): string {
    void this.history.pop(); // remove "current" location
    if (this.history.length > 0) {
      const previousLocation = this.history.pop();
      return previousLocation ?? defaultPath ?? '/';
    } else {
      return defaultPath ?? '/';
    }
  }

  /**
   * Gets the previous URI location in the history split into path and query params.
   * @param defaultPath if the history is empty, return this path as fallback value
   * @returns the URI, or '/' if no default was given. If there are no query parameters, `queryParams` will be undefined.
   */
  previousRoute(defaultPath?: string): { raw: string; path: string; queryParams?: { [key: string]: string } } {
    const raw = this.previousLocation(defaultPath);
    let path = raw;
    const split = raw.split('?');
    let queryParams: { [key: string]: string } | undefined = undefined;
    if (split.length > 1) {
      path = split[0];
      queryParams = {};
      new URLSearchParams(`?${split[1]}`).forEach((v, k) => {
        queryParams = { ...queryParams, [k]: v };
      });
    }
    return {
      raw,
      path,
      queryParams,
    };
  }
}
