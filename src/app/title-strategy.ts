import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable()
export class AppAndPageTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title) {
    super();
  }

  override updateTitle(routerState: RouterStateSnapshot): void {
    const defaultTitle = $localize`APPUiO Cloud Portal`;
    const title = this.buildTitle(routerState);
    if (title !== undefined) {
      this.title.setTitle(`${defaultTitle} - ${title}`);
    } else {
      this.title.setTitle(defaultTitle);
    }
  }
}
