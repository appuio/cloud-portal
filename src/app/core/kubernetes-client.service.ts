import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ZoneList } from '../types/zone';
import { SelfSubjectAccessReview } from '../types/self-subject-access-review';
import { Organization, OrganizationList } from '../types/organization';

@Injectable({
  providedIn: 'root',
})
export class KubernetesClientService {
  constructor(private httpClient: HttpClient) {}

  getZoneList(): Observable<ZoneList> {
    return this.httpClient.get<ZoneList>('appuio-api/apis/appuio.io/v1/zones');
  }

  getOrganizationList(): Observable<OrganizationList> {
    return this.httpClient.get<OrganizationList>('appuio-api/apis/organization.appuio.io/v1/organizations');
  }

  addOrganization(organization: Organization): Observable<Organization> {
    return this.httpClient.post<Organization>('appuio-api/apis/organization.appuio.io/v1/organizations', organization);
  }

  updateOrganization(organization: Organization): Observable<Organization> {
    return this.httpClient.put<Organization>(
      'appuio-api/apis/organization.appuio.io/v1/organizations/' + organization.metadata.name,
      organization
    );
  }

  getOrganizationPermission(): Observable<boolean> {
    return this.getPermission('list', 'organizations', 'organization.appuio.io');
  }

  getZonePermission(): Observable<boolean> {
    return this.getPermission('list', 'zones', 'appuio.io');
  }

  private getPermission(verb: string, resource: string, group: string): Observable<boolean> {
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
