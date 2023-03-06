import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { InvitationsComponent } from './invitations.component';
import { InvitationsRoutingModule } from './invitations-routing.module';

@NgModule({
  declarations: [InvitationsComponent],
  imports: [SharedModule, InvitationsRoutingModule],
})
export default class InvitationsModule {}
