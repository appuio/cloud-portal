import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KubeconfigDownloadComponent } from './kubeconfig.component';

import { KubeconfigDownloadRoutingModule } from './kubeconfig-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ReplaceValuesPipe } from './replace-values.pipe';

@NgModule({
  declarations: [KubeconfigDownloadComponent, ReplaceValuesPipe],
  imports: [CommonModule, SharedModule, KubeconfigDownloadRoutingModule],
})
export default class KubeconfigDownloadModule {}
