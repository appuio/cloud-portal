import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { faWarning } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ZoneCollectionService } from '../../store/zone-collection.service';
import { Zone } from '../../types/zone';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { ZoneDetailComponent } from '../zone/zone-detail.component';
import { NgIf } from '@angular/common';
import { LetDirective } from '@ngrx/component';

@Component({
    selector: 'app-single-zone',
    templateUrl: './single-zone.component.html',
    styleUrls: ['./single-zone.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        LetDirective,
        NgIf,
        ZoneDetailComponent,
        MessagesModule,
        SharedModule,
        FontAwesomeModule,
    ],
})
export class SingleZoneComponent implements OnInit {
  zone$?: Observable<Zone>;
  faWarning = faWarning;

  constructor(private route: ActivatedRoute, private zoneService: ZoneCollectionService) {}

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('name');
    if (!name) {
      throw new Error('name of the zone is required in the URL');
    }
    this.zone$ = this.zoneService.getByKeyMemoized(name);
  }
}
