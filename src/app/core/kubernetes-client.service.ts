import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ZoneList } from '../types/zone';
import { SelfSubjectAccessReview } from '../types/self-subject-access-review';

@Injectable({
  providedIn: 'root',
})
export class KubernetesClientService {
  constructor(private httpClient: HttpClient) {}

  getZoneList(): Observable<ZoneList> {
    return this.httpClient.get<ZoneList>('appuio-api/apis/appuio.io/v1/zones');
  }

  getZonePermission(): Observable<boolean> {
    return this.httpClient
      .post<SelfSubjectAccessReview>(
        'appuio-api/apis/authorization.k8s.io/v1/selfsubjectaccessreviews',
        new SelfSubjectAccessReview('list', 'zones', 'appuio.io')
      )
      .pipe(
        map((result) => {
          return result.status?.allowed ?? false;
        })
      );
  }
}
