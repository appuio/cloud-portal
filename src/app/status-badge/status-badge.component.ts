import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IncidentType } from '../types/statuspal';
import { StatusService } from '../store/status.service';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent implements OnInit {
  status?: string;

  constructor(private statusService: StatusService, private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadStatus();
  }

  openStatusPage(): void {
    window.open('https://status.appuio.cloud', '_blank')?.focus();
  }

  private loadStatus(): void {
    this.statusService.getStatus().subscribe((statusPageStatus) => {
      if (!statusPageStatus.status_page.current_incident_type) {
        this.status = 'success';
      } else if (statusPageStatus.status_page.current_incident_type === IncidentType.minor) {
        this.status = 'warning';
      } else if (statusPageStatus.status_page.current_incident_type === IncidentType.major) {
        this.status = 'danger';
      } else if (statusPageStatus.status_page.current_incident_type === IncidentType.scheduled) {
        this.status = 'info';
      }
      this.changeDetectorRef.markForCheck();
    });
  }
}
