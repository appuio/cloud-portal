import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { ZoneList } from '../types/zone';
import { newSelfSubjectAccessReview, SelfSubjectAccessReview } from '../types/self-subject-access-review';
import { Verb } from '../store/app.reducer';

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

  getZonePermission(): Observable<Verb[]> {
    return this.getPermissions('', 'zones', 'appuio.io', Verb.List);
  }

  private getPermissions(namespace: string, resource: string, group: string, ...verbs: Verb[]): Observable<Verb[]> {
    const requests = verbs.map((verb) =>
      this.httpClient
        .post<SelfSubjectAccessReview>(
          'appuio-api/apis/authorization.k8s.io/v1/selfsubjectaccessreviews',
          newSelfSubjectAccessReview(verb, resource, group, namespace)
        )
        .pipe(map((result) => result.status?.allowed ?? false))
    );
    return forkJoin(requests).pipe(map((results) => verbs.filter((verb, index) => results[index])));
  }
}
