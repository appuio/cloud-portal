import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KubeconfigDownloadComponent } from './kubeconfig-download.component';

import { KubeconfigDownloadRoutingModule } from './kubeconfig-download-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [KubeconfigDownloadComponent],
  imports: [CommonModule, SharedModule, KubeconfigDownloadRoutingModule],
})
export class KubeconfigDownloadModule {}
