import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { ZoneList } from '../types/zone';
import { SelfSubjectAccessReview } from '../types/self-subject-access-review';
import { Organization, OrganizationList } from '../types/organization';
import { Verb } from '../store/app.reducer';

@Injectable({
  providedIn: 'root',
})
export class KubernetesClientService {
  private readonly apiPrefix = 'appuio-api';
  private readonly zonesApi = `${this.apiPrefix}/apis/appuio.io/v1/zones`;
  private readonly organizationsApi = `${this.apiPrefix}/apis/organization.appuio.io/v1/organizations`;

  constructor(private httpClient: HttpClient) {}

  getZoneList(): Observable<ZoneList> {
    return this.httpClient.get<ZoneList>(this.zonesApi);
  }

  getOrganizationList(): Observable<OrganizationList> {
    return this.httpClient.get<OrganizationList>(this.organizationsApi);
  }

  addOrganization(organization: Organization): Observable<Organization> {
    return this.httpClient.post<Organization>(this.organizationsApi, organization);
  }

  updateOrganization(organization: Organization): Observable<Organization> {
    return this.httpClient.put<Organization>(`${this.organizationsApi}/${organization.metadata.name}`, organization);
  }

  getOrganizationPermission(): Observable<Verb[]> {
    return forkJoin([
      this.getPermission(Verb.List, 'organizations', 'organization.appuio.io'),
      this.getPermission(Verb.Create, 'organizations', 'organization.appuio.io'),
      this.getPermission(Verb.Update, 'organizations', 'organization.appuio.io'),
    ]).pipe(
      map(([list, create, update]) => {
        const result: Verb[] = [];
        if (list) {
          result.push(Verb.List);
        }
        if (create) {
          result.push(Verb.Create);
        }
        if (update) {
          result.push(Verb.Update);
        }
        return result;
      })
    );
  }

  getZonePermission(): Observable<Verb[]> {
    return this.getPermission(Verb.List, 'zones', 'appuio.io').pipe(map((result) => (result ? [Verb.List] : [])));
  }

  private getPermission(verb: Verb, resource: string, group: string): Observable<boolean> {
    return this.httpClient
      .post<SelfSubjectAccessReview>(
        'appuio-api/apis/authorization.k8s.io/v1/selfsubjectaccessreviews',
        new SelfSubjectAccessReview(verb, resource, group)
      )
      .pipe(
        map((result) => {
          return result.status?.allowed ?? false;
        })
      );
  }
}
