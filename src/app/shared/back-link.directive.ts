import { Directive, HostListener } from '@angular/core';
import { NavigationService } from './navigation.service';

@Directive({
  selector: '[appBackLink]',
})
export class BackLinkDirective {
  constructor(private navigation: NavigationService) {}

  @HostListener('click')
  onClick(): void {
    this.navigation.back();
  }
}
