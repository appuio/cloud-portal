import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { faInfoCircle, faWarning } from '@fortawesome/free-solid-svg-icons';
import { Zone } from '../types/zone';
import { map, Observable } from 'rxjs';
import { ZoneCollectionService } from '../store/zone-collection.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { ZoneDetailComponent } from './zone/zone-detail.component';
import { NgFor, NgIf } from '@angular/common';
import { LetDirective } from '@ngrx/component';

@Component({
    selector: 'app-zones',
    templateUrl: './zones.component.html',
    styleUrls: ['./zones.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        LetDirective,
        NgFor,
        ZoneDetailComponent,
        NgIf,
        MessagesModule,
        SharedModule,
        FontAwesomeModule,
    ],
})
export class ZonesComponent implements OnInit {
  zones$?: Observable<Zone[]>;

  faInfo = faInfoCircle;
  faWarning = faWarning;

  constructor(private zoneService: ZoneCollectionService) {}

  ngOnInit(): void {
    this.zones$ = this.zoneService
      .getAllMemoized()
      .pipe(map((zones) => zones.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name))));
  }
}
