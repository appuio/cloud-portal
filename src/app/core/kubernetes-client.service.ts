import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { ZoneList } from '../types/zone';
import { SelfSubjectAccessReview } from '../types/self-subject-access-review';
import { Organization, OrganizationList } from '../types/organization';
import { Verb } from '../store/app.reducer';
import { OrganizationMembers } from '../types/organization-members';
import { Team } from '../types/team';
import { List } from '../types/list';

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

  getOrganizationList(limit = 0): Observable<OrganizationList> {
    let params = new HttpParams();
    if (limit > 0) {
      params = params.set('limit', limit);
    }
    return this.httpClient.get<OrganizationList>(this.organizationsApi, { params });
  }

  getTeamList(namespace: string): Observable<List<Team>> {
    return this.httpClient.get<List<Team>>(`${this.apiPrefix}/apis/appuio.io/v1/namespaces/${namespace}/teams`);
  }

  getTeam(namespace: string, name: string): Observable<Team> {
    return this.httpClient.get<Team>(`${this.apiPrefix}/apis/appuio.io/v1/namespaces/${namespace}/teams/${name}`);
  }

  addTeam(team: Team): Observable<Team> {
    return this.httpClient.post<Team>(
      `${this.apiPrefix}/apis/appuio.io/v1/namespaces/${team.metadata.namespace}/teams`,
      team
    );
  }

  updateTeam(team: Team): Observable<Team> {
    return this.httpClient.put<Team>(
      `${this.apiPrefix}/apis/appuio.io/v1/namespaces/${team.metadata.namespace}/teams/${team.metadata.name}`,
      team
    );
  }

  deleteTeam(namespace: string, name: string): Observable<unknown> {
    return this.httpClient.delete(`${this.apiPrefix}/apis/appuio.io/v1/namespaces/${namespace}/teams/${name}`);
  }

  getOrganizationMembers(namespace: string): Observable<OrganizationMembers> {
    return this.httpClient.get<OrganizationMembers>(
      `appuio-api/apis/appuio.io/v1/namespaces/${namespace}/organizationmembers/members`
    );
  }

  updateOrganizationMembers(organizationMembers: OrganizationMembers): Observable<OrganizationMembers> {
    return this.httpClient.put<OrganizationMembers>(
      `appuio-api/apis/appuio.io/v1/namespaces/${organizationMembers.metadata.namespace}/organizationmembers/members`,
      organizationMembers
    );
  }

  addOrganization(organization: Organization): Observable<Organization> {
    return this.httpClient.post<Organization>(this.organizationsApi, organization);
  }

  updateOrganization(organization: Organization): Observable<Organization> {
    return this.httpClient.put<Organization>(`${this.organizationsApi}/${organization.metadata.name}`, organization);
  }

  getOrganizationsPermission(): Observable<Verb[]> {
    return this.getPermissions('', 'organizations', 'rbac.appuio.io', Verb.List, Verb.Create);
  }

  getTeamsPermission(namespace: string): Observable<Verb[]> {
    return this.getPermissions(namespace, 'teams', 'appuio.io', Verb.List, Verb.Update, Verb.Create, Verb.Delete);
  }

  getOrganizationPermission(namespace: string, verb: Verb = Verb.Update): Observable<Verb[]> {
    return this.getPermissions(namespace, 'organizations', 'rbac.appuio.io', verb);
  }

  getZonePermission(): Observable<Verb[]> {
    return this.getPermissions('', 'zones', 'appuio.io', Verb.List);
  }

  getOrganizationMembersPermission(namespace: string, verb: Verb = Verb.List): Observable<Verb[]> {
    return this.getPermissions(namespace, 'organizationmembers', 'appuio.io', verb);
  }

  private getPermissions(namespace: string, resource: string, group: string, ...verbs: Verb[]): Observable<Verb[]> {
    const requests = verbs.map((verb) =>
      this.httpClient
        .post<SelfSubjectAccessReview>(
          'appuio-api/apis/authorization.k8s.io/v1/selfsubjectaccessreviews',
          new SelfSubjectAccessReview(verb, resource, group, namespace)
        )
        .pipe(map((result) => result.status?.allowed ?? false))
    );
    return forkJoin(requests).pipe(map((results) => verbs.filter((verb, index) => results[index])));
  }
}
