import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { faArrowUpRightFromSquare, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-info-menu-item',
  templateUrl: './info-menu-item.component.html',
  styleUrls: ['./info-menu-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, FontAwesomeModule],
})
export class InfoMenuItemComponent {
  @Input({ required: true })
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
