import { Injectable } from '@angular/core';
import { DefaultDataService, HttpUrlGenerator } from '@ngrx/data';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KubernetesClientService } from '../../core/kubernetes-client.service';
import { OrganizationMembers } from '../../types/organization-members';
import { organizationMembersEntityKey } from '../../store/entity-metadata-map';
import { Update } from '@ngrx/entity';

@Injectable({
  providedIn: 'root',
})
export class OrganizationMembersDataService extends DefaultDataService<OrganizationMembers> {
  constructor(http: HttpClient, httpUrlGenerator: HttpUrlGenerator, private kubeService: KubernetesClientService) {
    super(organizationMembersEntityKey, http, httpUrlGenerator);
  }

  override getById(key: number | string): Observable<OrganizationMembers> {
    return this.kubeService.getOrganizationMembers(key.toString());
  }

  override update(update: Update<OrganizationMembers>): Observable<OrganizationMembers> {
    return this.kubeService.updateOrganizationMembers(update.changes as OrganizationMembers);
  }
}
