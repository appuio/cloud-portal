import {ChangeDetectionStrategy, Component} from '@angular/core';
import {KubernetesClientService} from "../kubernetes-client.service";

@Component({
  selector: 'app-zones',
  templateUrl: './zones.component.html',
  styleUrls: ['./zones.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZonesComponent {

  zones$ = this.kubernetesClientService.getZones();

  constructor(private kubernetesClientService: KubernetesClientService) {
  }

}
