import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';

/**
 * See https://nils-mehlhorn.de/posts/angular-navigate-back-previous-page/
 */
@Injectable({ providedIn: 'root' })
export class NavigationService {
  private history: string[] = [];

  constructor(private router: Router, private location: Location) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.history.push(event.urlAfterRedirects);
      }
    });
  }

  back(): void {
    const record = this.history.pop();
    if (this.history.length > 0) {
      this.location.back();
    } else {
      window.history.replaceState(null, '', '/');
      window.history.pushState(null, '', record ?? this.router.url);
      this.location.back();
    }
  }
}
