import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OrganizationNameService {
  MAX_LENGTH = 63;
  validationPattern = /(([a-z0-9][-a-z0-9]*)?[a-z0-9])?/;
  allWhitespaces = /[\s-]+/g;
  invalidStartingCharacters = /^[^a-z0-9]+/;
  invalidEndingCharacters = /[^a-z0-9]+$/;

  tranformToKubeName(displayName: string): string {
    return displayName
      .trim()
      .toLowerCase()
      .replace(this.allWhitespaces, '-')
      .replace(this.invalidStartingCharacters, '')
      .replace(this.invalidEndingCharacters, '')
      .substring(0, this.MAX_LENGTH);
  }

  getValidationPattern(): RegExp {
    return this.validationPattern;
  }
}
