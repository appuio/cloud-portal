import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-app-cat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-cat.component.html',
  styleUrls: ['./app-cat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppCatComponent {

}
