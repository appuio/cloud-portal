import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { IdentityService } from '../../core/identity.service';

@Component({
  selector: 'app-join-organization-dialog',
  templateUrl: './join-organization-dialog.component.html',
  styleUrls: ['./join-organization-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinOrganizationDialogComponent implements OnInit {
  username = '';
  mailto = '';
  faPaperPlane = faPaperPlane;

  constructor(private identityService: IdentityService) {}

  ngOnInit(): void {
    this.username = this.identityService.getUsername();
    const name = this.identityService.getName();
    const body = encodeURI(
      $localize`Hi\n\nI would like to join the APPUiO Cloud organization. My username on APPUiO Cloud is "${this.username}".\n\nBest wishes\n${name}`
    );
    const subject = encodeURI($localize`Join Organization`);
    this.mailto = `mailto:?subject=${subject}&body=${body}`;
  }
}
