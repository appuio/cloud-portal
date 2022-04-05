// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any
  interface Chainable<Subject = any> {
    setupAuth(): typeof setupAuth;

    setPermission(
      ...permission: { verb: string; resource: string; group: string; namespace?: string }[]
    ): typeof setPermission;
  }
}

function setPermission(...permission: { verb: string; resource: string; group: string; namespace?: string }[]): void {
  cy.intercept('POST', 'appuio-api/apis/authorization.k8s.io/v1/selfsubjectaccessreviews', (request) => {
    const requestBody = request.body;
    const resourceAttributes = requestBody.spec.resourceAttributes;
    if (
      permission.find(
        (p) =>
          resourceAttributes.verb === p.verb &&
          resourceAttributes.resource === p.resource &&
          resourceAttributes.group === p.group &&
          ((!p.namespace && resourceAttributes.namespace === '') || resourceAttributes.namespace === p.namespace)
      )
    ) {
      requestBody.status = { allowed: true, reason: 'match' };
    } else {
      requestBody.status = { allowed: false, reason: 'no match' };
    }
    request.reply(requestBody);
  });
}

function setupAuth(): void {
  // needed for initial getUser request
  cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });

  cy.intercept('GET', 'https://id.dev.appuio.cloud/auth/realms/development/.well-known/openid-configuration', {
    fixture: 'well-known.json',
  });
  cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
    fixture: 'user-mig-without-default-organisation.json',
  });
  window.sessionStorage.setItem('id_token', 'token');
  window.sessionStorage.setItem('access_token', 'token');
  window.sessionStorage.setItem(
    'id_token_claims_obj',
    JSON.stringify({
      exp: 1642607047,
      iat: 1642606747,
      auth_time: 1642506182,
      jti: 'ca989eba-d31a-4196-ac4c-cd0e1429481b',
      iss: 'https://id.dev.appuio.cloud/auth/realms/development',
      aud: 'local-dev',
      sub: 'abf7ae0c-e6da-4451-93cb-4303a7cba314',
      typ: 'ID',
      azp: 'local-dev',
      nonce: 'Y0NaOTAxbXVBeW1-RUMzRUl3ZldBRF9ENnB3RVBJUjZka2VSOEN-cmx4LlZ6',
      session_state: '5420a178-dc2a-4828-9433-819e6444d327',
      at_hash: 'OZ_XRmCxHbwb50CVApNdEw',
      acr: '1',
      sid: '5420a178-dc2a-4828-9433-819e6444d327',
      email_verified: true,
      name: 'Michi Gerber',
      groups: ['offline_access', 'default-roles-development', 'admin', 'uma_authorization'],
      preferred_username: 'mig',
      given_name: 'Michi',
      family_name: 'Gerber',
      email: 'michael.gerber@nxt.engineering',
    })
  );
  const date = new Date();
  date.setMinutes(date.getMinutes() + 15);
  const time = String(date.getTime());
  window.sessionStorage.setItem('id_token_expires_at', time);
  window.sessionStorage.setItem('access_token_expires_at', time);
  window.sessionStorage.setItem('expires_at', time);
  window.sessionStorage.setItem('access_token_stored_at', time);
  window.sessionStorage.setItem('id_token_expires_at', time);
  window.sessionStorage.setItem('id_token_stored_at', time);
}

Cypress.Commands.add('setupAuth', setupAuth);
Cypress.Commands.add('setPermission', setPermission);
