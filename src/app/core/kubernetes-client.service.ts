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
      this.getPermission('list', 'organizations', 'organization.appuio.io'),
      this.getPermission('create', 'organizations', 'organization.appuio.io'),
      this.getPermission('update', 'organizations', 'organization.appuio.io'),
    ]).pipe(
      map(([list, create, update]) => {
        const result: Verb[] = [];
        if (list) {
          result.push('list');
        }
        if (create) {
          result.push('create');
        }
        if (update) {
          result.push('update');
        }
        return result;
      })
    );
  }

  getZonePermission(): Observable<Verb[]> {
    return this.getPermission('list', 'zones', 'appuio.io').pipe(map((result) => (result ? ['list'] : [])));
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
