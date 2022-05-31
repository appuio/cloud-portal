import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { Reference } from '../info-menu/info-menu.component';

@Component({
  selector: 'app-info-menu-item',
  templateUrl: './info-menu-item.component.html',
  styleUrls: ['./info-menu-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoMenuItemComponent {
  @Input()
  item!: Reference;

  @Input()
  even = false;

  faExternal = faArrowUpRightFromSquare;
}
