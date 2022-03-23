import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Md5 } from 'ts-md5';

@Injectable({
  providedIn: 'root',
})
export class IdentityService {
  constructor(private oauthService: OAuthService) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getIdentityClaims(): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.oauthService.getIdentityClaims() as any;
  }

  getUsername(): string {
    return this.getIdentityClaims().preferred_username;
  }

  getName(): string {
    return this.getIdentityClaims().name;
  }

  getAvatarUrl(): string {
    const identityClaims = this.getIdentityClaims();
    const hash = identityClaims.email?.length ? Md5.hashStr(identityClaims.email) : '';
    return `https://www.gravatar.com/avatar/${hash}`;
  }

  getEmail(): string {
    return this.getIdentityClaims().email;
  }
}
