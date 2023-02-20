import { newSelfSubjectAccessReviewFromId, SelfSubjectAccessReview } from '../types/self-subject-access-review';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { KubernetesClientService } from '../core/kubernetes-client.service';
import { selfSubjectAccessReviewEntityKey } from './entity-metadata-map';
import { HttpClient } from '@angular/common/http';
import { KubernetesDataService } from './kubernetes-data.service';
import { KubernetesUrlGenerator } from './kubernetes-url-generator.service';

@Injectable({ providedIn: 'root' })
export class SelfSubjectAccessReviewDataService extends KubernetesDataService<SelfSubjectAccessReview> {
  constructor(private kubeService: KubernetesClientService, http: HttpClient, urlGenerator: KubernetesUrlGenerator) {
    super(selfSubjectAccessReviewEntityKey, http, urlGenerator);
  }

  override getById(key: number | string): Observable<SelfSubjectAccessReview> {
    return this.execute(
      'POST',
      this.urlGenerator.getEntity(this.name, '', 'CREATE'),
      newSelfSubjectAccessReviewFromId(key.toString())
    );
  }
}
