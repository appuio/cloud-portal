import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { faArrowUpRightFromSquare, IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-info-menu-item',
  templateUrl: './info-menu-item.component.html',
  styleUrls: ['./info-menu-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoMenuItemComponent {
  @Input()
  item!: Item;

  @Input()
  even = false;

  faExternal = faArrowUpRightFromSquare;
}
export interface Item {
  label: string;
  subTitle?: string;
  href?: string;
  routerLink?: string[];
  icon?: IconDefinition;
}
