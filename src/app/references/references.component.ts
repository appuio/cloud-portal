import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-references',
  templateUrl: './references.component.html',
  styleUrls: ['./references.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferencesComponent {
  references: Reference[] = [
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
}

export interface Reference {
  label: string;
  href: string;
}
