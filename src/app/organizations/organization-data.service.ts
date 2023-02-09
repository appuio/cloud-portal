import { Injectable } from '@angular/core';
import { DefaultDataService, HttpUrlGenerator } from '@ngrx/data';
import { Update } from '@ngrx/entity';
import { Organization } from '../types/organization';
import { HttpClient } from '@angular/common/http';
import { organizationEntityKey } from '../store/entity-metadata-map';
import { map, Observable } from 'rxjs';
import { KubernetesClientService } from '../core/kubernetes-client.service';

@Injectable({
  providedIn: 'root',
})
export class OrganizationDataService extends DefaultDataService<Organization> {
  constructor(http: HttpClient, httpUrlGenerator: HttpUrlGenerator, private kubeService: KubernetesClientService) {
    super(organizationEntityKey, http, httpUrlGenerator);
  }

  override getAll(): Observable<Organization[]> {
    return this.kubeService.getOrganizationList(0).pipe(
      map((list) => {
        //throw new Error('miep');
        //return [];
        return list.items;
      })
      //delay(1500)
    );
  }

  override add(entity: Organization): Observable<Organization> {
    return this.kubeService
      .addOrganization(entity)
      .pipe
      //delay(1500) // fake some delay
      ();
  }

  override update(update: Update<Organization>): Observable<Organization> {
    return this.kubeService.updateOrganization(update.changes as Organization);
  }
}
