import {Component, ChangeDetectionStrategy, Input} from '@angular/core';
import {MenuItem} from "primeng/api";

@Component({
  selector: 'app-navbar-item',
  templateUrl: './navbar-item.component.html',
  styleUrls: ['./navbar-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarItemComponent {

  @Input() menuItem!: MenuItem;

}
