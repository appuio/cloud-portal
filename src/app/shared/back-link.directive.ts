import { Directive, HostListener, Input } from '@angular/core';
import { NavigationService } from './navigation.service';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * This directive adds a `click` event listener to navigate back in history.
 * It accepts an input that is used as the default path in case there is no history (e.g. opened link in a new tab).
 */
@Directive({
  selector: '[appBackLink]',
  standalone: true,
})
export class BackLinkDirective {
  constructor(
    private navigation: NavigationService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  @Input()
  appBackLink?: string;

  @Input()
  clearAllQueryParams?: boolean;

  @Input()
  removeQueryParamList?: string[];

  @HostListener('click')
  onClick(): void {
    let route = this.navigation.previousRoute(this.appBackLink);
    while (route.path === window.location.pathname) {
      // same path, try again
      route = this.navigation.previousRoute(this.appBackLink);
    }
    if (this.clearAllQueryParams) {
      route.queryParams = undefined;
    }
    this.removeQueryParamList?.forEach((p) => {
      if (route.queryParams) {
        delete route.queryParams[p];
      }
    });
    void this.router.navigate([route.path], { relativeTo: this.activatedRoute, queryParams: route.queryParams });
  }
}
