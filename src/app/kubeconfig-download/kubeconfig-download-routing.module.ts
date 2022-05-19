import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KubeconfigDownloadComponent } from './kubeconfig-download.component';

const routes: Routes = [{ path: '', component: KubeconfigDownloadComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KubeconfigDownloadRoutingModule {}
