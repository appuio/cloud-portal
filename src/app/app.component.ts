import {Component, Inject, LOCALE_ID} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  date = new Date();
  number = 1000000;
  constructor(@Inject(LOCALE_ID) locale: any) {
    console.log(locale);
  }
}
