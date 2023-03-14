import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { InvitationsComponent } from './invitations.component';
import { InvitationsRoutingModule } from './invitations-routing.module';
import { InvitationDetailComponent } from './invitation-detail/invitation-detail.component';
import { InvitationViewComponent } from './invitation-view/invitation-view.component';

@NgModule({
  declarations: [InvitationsComponent, InvitationDetailComponent, InvitationViewComponent],
  imports: [SharedModule, InvitationsRoutingModule],
})
export default class InvitationsModule {}
