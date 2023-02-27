import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { ZoneList } from '../types/zone';
import { newSelfSubjectAccessReview, SelfSubjectAccessReview } from '../types/self-subject-access-review';
import { Verb } from '../store/app.reducer';
import { Team } from '../types/team';
import { List } from '../types/list';
import { User } from '../types/user';

@Injectable({
  providedIn: 'root',
})
export class KubernetesClientService {
  private readonly apiPrefix = 'appuio-api';
  private readonly zonesApi = `${this.apiPrefix}/apis/appuio.io/v1/zones`;
  private readonly usersApi = `${this.apiPrefix}/apis/appuio.io/v1/users`;

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
          newSelfSubjectAccessReview(verb, resource, group, namespace)
        )
        .pipe(map((result) => result.status?.allowed ?? false))
    );
    return forkJoin(requests).pipe(map((results) => verbs.filter((verb, index) => results[index])));
  }
}
