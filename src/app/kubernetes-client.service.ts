import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ZoneList} from './types/zone';

@Injectable({
  providedIn: 'root'
})
export class KubernetesClientService {

  constructor(private httpClient: HttpClient) {
  }

  getZoneList(): Observable<ZoneList> {
    return this.httpClient.get<ZoneList>('appuio-api/apis/appuio.io/v1/zones');
  }
}
