import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-productboard',
    templateUrl: './productboard.component.html',
    styleUrls: ['./productboard.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
})
export class ProductboardComponent implements OnInit {
  ngOnInit(): void {
    console.log('hello from productboard');
  }
}
