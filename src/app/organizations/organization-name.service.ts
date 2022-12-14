import { Injectable } from '@angular/core';
import slugify from '@sindresorhus/slugify';

@Injectable({
  providedIn: 'root',
})
export class OrganizationNameService {
  MAX_LENGTH = 63;
  validationPattern = '(([a-z0-9][-a-z0-9]*)?[a-z0-9])?';

  tranformToKubeName(displayName: string): string {
    const slug = slugify(displayName.trim());
    return slug.substring(0, this.MAX_LENGTH);
  }

  getValidationPattern(): string {
    return this.validationPattern;
  }
}
