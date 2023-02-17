import { DefaultDataService, HttpUrlGenerator } from '@ngrx/data';
import { SelfSubjectAccessReview } from '../types/self-subject-access-review';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { KubernetesClientService } from '../core/kubernetes-client.service';
import { composeSsarId, decomposeSsarId, selfSubjectAccessReviewEntityKey } from './entity-metadata-map';
import { HttpClient } from '@angular/common/http';
import { Verb } from './app.reducer';

@Injectable({ providedIn: 'root' })
export class SelfSubjectAccessReviewDataService extends DefaultDataService<SelfSubjectAccessReview> {
  constructor(private kubeService: KubernetesClientService, http: HttpClient, urlGenerator: HttpUrlGenerator) {
    super(selfSubjectAccessReviewEntityKey, http, urlGenerator);
  }

  override getById(key: number | string): Observable<SelfSubjectAccessReview> {
    const attr = decomposeSsarId(key.toString());
    return this.kubeService.getSelfSubjectAccessReview(attr.namespace, attr.resource, attr.group, attr.verb);
  }
}

export const clusterOrganizationSsarIDs = [
  composeSsarId(new SelfSubjectAccessReview(Verb.List, 'organizations', 'rbac.appuio.io', '')),
  composeSsarId(new SelfSubjectAccessReview(Verb.Create, 'organizations', 'rbac.appuio.io', '')),
  composeSsarId(new SelfSubjectAccessReview(Verb.Update, 'organizations', 'rbac.appuio.io', '')),
];
