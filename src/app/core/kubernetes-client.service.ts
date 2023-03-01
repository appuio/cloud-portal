import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ZoneList } from '../types/zone';

@Injectable({
  providedIn: 'root',
})
export class KubernetesClientService {
  private readonly apiPrefix = 'appuio-api';
  private readonly zonesApi = `${this.apiPrefix}/apis/appuio.io/v1/zones`;

  constructor(private httpClient: HttpClient) {}

  getZoneList(): Observable<ZoneList> {
    return this.httpClient.get<ZoneList>(this.zonesApi);
  }
}
