import { Directive, HostListener, Input } from '@angular/core';
import { NavigationService } from './navigation.service';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * This directive adds a `click` event listener to navigate back in history.
 * It accepts an input that is used as the default path in case there is no history (e.g. opened link in a new tab).
 */
@Directive({
  selector: '[appBackLink]',
})
export class BackLinkDirective {
  constructor(private navigation: NavigationService, private router: Router, private activatedRoute: ActivatedRoute) {}

  @Input()
  appBackLink?: string;

  @HostListener('click')
  onClick(): void {
    const route = this.navigation.previousLocation(this.appBackLink);
    void this.router.navigate([route], { relativeTo: this.activatedRoute });
  }
}
