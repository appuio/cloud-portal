import { Component, ChangeDetectionStrategy } from '@angular/core';
import { faQuestionCircle, faTerminal } from '@fortawesome/free-solid-svg-icons';
import { Item, InfoMenuItemComponent } from '../info-menu-item/info-menu-item.component';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { StyleClassModule } from 'primeng/styleclass';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'app-info-menu',
    templateUrl: './info-menu.component.html',
    styleUrls: ['./info-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        RippleModule,
        StyleClassModule,
        FontAwesomeModule,
        NgFor,
        NgIf,
        InfoMenuItemComponent,
        RouterLink,
    ],
})
export class InfoMenuComponent {
  references: Item[] = [
    {
      label: $localize`APPUiO Control API`,
      subTitle: $localize`How to Connect to the APPUiO Control API via kubectl`,
      routerLink: ['kubeconfig'],
      icon: faTerminal,
    },
    {
      label: $localize`APPUiO Cloud Website`,
      href: 'https://www.appuio.cloud',
    },
    {
      label: $localize`Product Documentation`,
      href: 'https://products.docs.vshn.ch/products/appuio/cloud/index.html',
    },
    {
      label: $localize`Status Page`,
      href: 'https://status.appuio.cloud',
    },
    {
      label: $localize`Product Roadmap`,
      href: 'https://roadmap.appuio.cloud',
    },
    {
      label: $localize`Discussions and Help`,
      href: 'https://discuss.appuio.cloud',
    },
    {
      label: $localize`Community Chat`,
      href: 'https://community.appuio.ch',
    },
    {
      label: $localize`End-User Documentation`,
      href: 'https://docs.appuio.cloud',
    },
    {
      label: $localize`System Documentation`,
      href: 'https://kb.vshn.ch/appuio-cloud',
    },
  ];

  faQuestion = faQuestionCircle;
}
