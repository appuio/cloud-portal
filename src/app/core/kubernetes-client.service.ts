import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { ZoneList } from '../types/zone';
import { SelfSubjectAccessReview } from '../types/self-subject-access-review';
import { Verb } from '../store/app.reducer';
import { OrganizationMembers } from '../types/organization-members';
import { Team } from '../types/team';
import { List } from '../types/list';
import { User } from '../types/user';
import { RoleBindingList, RoleBindings } from '../types/role-bindings';

@Injectable({
  providedIn: 'root',
})
export class KubernetesClientService {
  private readonly apiPrefix = 'appuio-api';
  private readonly zonesApi = `${this.apiPrefix}/apis/appuio.io/v1/zones`;
  private readonly usersApi = `${this.apiPrefix}/apis/appuio.io/v1/users`;
  private readonly organizationsApi = `${this.apiPrefix}/apis/organization.appuio.io/v1/organizations`;
  private readonly authApi = `${this.apiPrefix}/apis/rbac.authorization.k8s.io/v1`;

  constructor(private httpClient: HttpClient) {}

  getZoneList(): Observable<ZoneList> {
    return this.httpClient.get<ZoneList>(this.zonesApi);
  }

  getUser(username: string): Observable<User> {
    return this.httpClient.get<User>(`${this.usersApi}/${username}`);
  }

  updateUser(user: User): Observable<User> {
    return this.httpClient.put<User>(`${this.usersApi}/${user.metadata.name}`, user);
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

  getRoleBindings(namespace: string): Observable<RoleBindingList> {
    return this.httpClient.get<RoleBindingList>(`${this.authApi}/namespaces/${namespace}/rolebindings`);
  }

  updateRoleBinding(roleBinding: RoleBindings): Observable<RoleBindings> {
    return this.httpClient.put<RoleBindings>(
      `${this.authApi}/namespaces/${roleBinding.metadata.namespace}/rolebindings/${roleBinding.metadata.name}`,
      roleBinding
    );
  }

  getOrganizationsPermission(): Observable<Verb[]> {
    return this.getPermissions('', 'organizations', 'rbac.appuio.io', Verb.List, Verb.Create);
  }

  getTeamsPermission(namespace: string): Observable<Verb[]> {
    return this.getPermissions(namespace, 'teams', 'appuio.io', Verb.List, Verb.Update, Verb.Create, Verb.Delete);
  }

  getZonePermission(): Observable<Verb[]> {
    return this.getPermissions('', 'zones', 'appuio.io', Verb.List);
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

  getSelfSubjectAccessReview(
    namespace: string,
    resource: string,
    group: string,
    verb: string
  ): Observable<SelfSubjectAccessReview> {
    return this.httpClient.post<SelfSubjectAccessReview>(
      'appuio-api/apis/authorization.k8s.io/v1/selfsubjectaccessreviews',
      new SelfSubjectAccessReview(verb, resource, group, namespace)
    );
  }
}
