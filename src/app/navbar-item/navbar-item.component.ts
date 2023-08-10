import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NavMenuItem } from '../app.component';
import { StyleClassModule } from 'primeng/styleclass';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RippleModule } from 'primeng/ripple';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-navbar-item',
  templateUrl: './navbar-item.component.html',
  styleUrls: ['./navbar-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, RippleModule, FontAwesomeModule, RouterLinkActive, RouterLink, StyleClassModule, NgFor],
})
export class NavbarItemComponent {
  @Input({ required: true }) menuItem!: NavMenuItem;
}
