import { newSelfSubjectAccessReviewFromId, SelfSubjectAccessReview } from '../types/self-subject-access-review';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { selfSubjectAccessReviewEntityKey } from './entity-metadata-map';
import { HttpClient } from '@angular/common/http';
import { KubernetesDataService } from './kubernetes-data.service';
import { KubernetesUrlGenerator } from './kubernetes-url-generator.service';

@Injectable({ providedIn: 'root' })
export class SelfSubjectAccessReviewDataService extends KubernetesDataService<SelfSubjectAccessReview> {
  constructor(http: HttpClient, urlGenerator: KubernetesUrlGenerator) {
    super(selfSubjectAccessReviewEntityKey, http, urlGenerator);
  }

  override getById(key: number | string): Observable<SelfSubjectAccessReview> {
    // Getting a permission entity is actually a create/POST operation in Kubernetes, thus we extend the default KubernetesDataService.
    return this.execute(
      'POST',
      this.urlGenerator.getEntity(this.name, '', 'POST'),
      newSelfSubjectAccessReviewFromId(key.toString())
    );
  }
}
