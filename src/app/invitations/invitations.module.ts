import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { InvitationsComponent } from './invitations.component';
import { InvitationsRoutingModule } from './invitations-routing.module';
import { InvitationDetailComponent } from './invitation-detail/invitation-detail.component';
import { InvitationViewComponent } from './invitation-view/invitation-view.component';
import { InvitationFormComponent } from './invitation-form/invitation-form.component';
import { InvitationEditComponent } from './invitation-edit/invitation-edit.component';

@NgModule({
    imports: [SharedModule, InvitationsRoutingModule, InvitationsComponent,
        InvitationDetailComponent,
        InvitationViewComponent,
        InvitationFormComponent,
        InvitationEditComponent],
})
export default class InvitationsModule {}
