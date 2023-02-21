import { createUser } from '../fixtures/user';
import {
  organizationListNxtVshn,
  organizationListNxtVshnWithDisplayName,
  organizationVshn,
} from '../fixtures/organization';
import { OrganizationPermissions } from '../../src/app/types/organization';
import { BillingEntityPermissions } from '../../src/app/types/billing-entity';

describe('Test organization list', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
    cy.disableCookieBanner();
  });
  beforeEach(() => {
    // needed for initial getUser request
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'nxt' }),
    });
  });

  it('list with two entries', () => {
    cy.setPermission({ verb: 'list', ...OrganizationPermissions });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.visit('/organizations');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'nxt');
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'vshn');
  });

  it('empty list', () => {
    cy.setPermission({ verb: 'list', ...OrganizationPermissions });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: { items: [] },
    });
    cy.visit('/organizations');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get('#no-organization-message').should('contain.text', 'No organizations available.');
  });

  it('request failed', () => {
    cy.setPermission({ verb: 'list', ...OrganizationPermissions });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      statusCode: 403,
    });
    cy.visit('/organizations');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get('#organization-failure-message').should('contain.text', 'Organizations could not be loaded.');
  });

  it('failed requests are retried', () => {
    cy.setPermission({ verb: 'list', ...OrganizationPermissions });

    let interceptCount = 0;
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', (req) => {
      if (interceptCount === 0) {
        interceptCount++;
        req.reply({ statusCode: 503 });
      } else {
        req.reply(organizationListNxtVshn);
      }
    });
    cy.visit('/organizations');

    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'nxt');
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'vshn');
  });

  it('no permission', () => {
    cy.visit('/organizations');
    cy.get('h1').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
  });
});

describe('Test organization edit', () => {
  beforeEach(() => {
    cy.setupAuth();
    // needed for initial getUser request
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'nxt' }),
    });
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
    cy.disableCookieBanner();
  });

  it('edit organization with button', () => {
    cy.setPermission(
      { verb: 'list', ...OrganizationPermissions },
      { verb: 'update', ...OrganizationPermissions, namespace: 'vshn' },
      { verb: 'list', ...BillingEntityPermissions }
    );
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshnWithDisplayName,
    });
    cy.visit('/organizations');
    cy.intercept('PUT', 'appuio-api/apis/organization.appuio.io/v1/organizations/vshn', {
      body: organizationVshn,
      statusCode: 200,
    }).as('update');
    cy.get('#organizations-title').should('contain.text', 'Organizations');

    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'nxt');
    cy.get(':nth-child(2) > .border-top-1 > .list-none > .flex > .text-900').should(
      'contain.text',
      'nxt Engineering GmbH'
    );
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'vshn');
    cy.get(':nth-child(3) > .border-top-1 > .list-none > .flex > .text-900').should('contain.text', 'VSHN AG');

    cy.get(':nth-child(2) > .flex-row [title="Edit organization"]').should('not.exist');
    cy.get(':nth-child(3) > .flex-row [title="Edit organization"]').click();
    cy.get('.text-3xl').should('contain.text', 'vshn');
    cy.get('#displayName').type('{selectall}');
    cy.get('#displayName').type('VSHN - the DevOps Company');
    cy.get('button[type=submit]').click();
    cy.wait('@update');
    cy.get('@update')
      .its('request.body')
      .then((body) => {
        expect(body.metadata.name).to.eq('vshn');
        expect(body.spec.displayName).to.eq('VSHN - the DevOps Company');
      });
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'nxt');
    cy.get(':nth-child(2) > .border-top-1 > .list-none > .flex > .text-900').should(
      'contain.text',
      'nxt Engineering GmbH'
    );
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'vshn');
    cy.get(':nth-child(3) > .border-top-1 > .list-none > .flex > .text-900').should(
      'contain.text',
      'VSHN - the DevOps Company'
    );
  });

  it('no edit permission', () => {
    cy.setPermission({ verb: 'list', ...OrganizationPermissions }, { verb: 'list', ...BillingEntityPermissions });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.visit('/organizations');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get(':nth-child(3) > .flex-row > .text-blue-500 > .ng-fa-icon').should('not.exist');
  });
  it('no billing list permission', () => {
    cy.setPermission(
      { verb: 'list', ...OrganizationPermissions },
      { verb: 'update', ...OrganizationPermissions, namespace: organizationVshn.metadata.name }
    );
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.visit('/organizations');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get(':nth-child(3) > .flex-row > .text-blue-500 > .ng-fa-icon').should('not.exist');
  });
});

describe('Test organization add', () => {
  beforeEach(() => {
    cy.setupAuth();
    // needed for initial getUser request
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'nxt' }),
    });
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
    cy.disableCookieBanner();
  });

  it('add organization with button', () => {
    cy.setPermission(
      { verb: 'list', ...OrganizationPermissions },
      { verb: 'create', ...OrganizationPermissions },
      { verb: 'list', ...BillingEntityPermissions },
      { verb: 'update', ...OrganizationPermissions, namespace: organizationVshn.metadata.name },
      { verb: 'list', resource: 'organizationmembers', group: 'appuio.io', namespace: organizationVshn.metadata.name }
    );

    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: { items: [] },
    });
    cy.intercept('POST', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationVshn,
      statusCode: 201,
    }).as('add');
    cy.visit('/organizations');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get('#no-organization-message').should('contain.text', 'No organizations available.');

    cy.get('#addOrganizationButton').click();

    cy.get('#displayName').type('VSHN - the DevOps Company');
    cy.get('#id').should('contain.value', 'vshn-the-dev-ops-company');
    cy.get('button[type=submit]').click();
    cy.wait('@add');
    cy.get('@add')
      .its('request.body')
      .then((body) => {
        expect(body.metadata.name).to.eq('vshn-the-dev-ops-company');
        expect(body.spec.displayName).to.eq('VSHN - the DevOps Company');
      });
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'vshn');
    cy.get(':nth-child(2) > .border-top-1 > .list-none > .flex > .text-900').should(
      'contain.text',
      'VSHN - the DevOps Company'
    );
    cy.get(':nth-child(2) > .flex-row [title="Edit organization"]').should('exist');
    cy.get(':nth-child(2) > .flex-row [title="Edit members"]').should('exist');
  });

  it('add organization with invalid id', () => {
    cy.setPermission(
      { verb: 'list', ...OrganizationPermissions },
      { verb: 'create', ...OrganizationPermissions },
      { verb: 'list', ...BillingEntityPermissions }
    );
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: { items: [] },
    });
    cy.visit('/organizations');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get('#no-organization-message').should('contain.text', 'No organizations available.');

    cy.get('#addOrganizationButton').click();

    cy.get('#displayName').type('VSHN - the DevOps Company');
    cy.get('#id').clear().type('VSHN $a');
    cy.get('.p-error').should('be.visible').and('contain.text', 'organization ID');
    cy.get('button[type=submit]').should('be.disabled');
  });

  it('add organization with invalid id - cannot start or end with a dash, spaces, upper cases', () => {
    cy.setPermission(
      { verb: 'list', ...OrganizationPermissions },
      { verb: 'create', ...OrganizationPermissions },
      { verb: 'list', ...BillingEntityPermissions }
    );
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: { items: [] },
    });
    cy.visit('/organizations');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get('#no-organization-message').should('contain.text', 'No organizations available.');

    cy.get('#addOrganizationButton').click();

    cy.get('#displayName').type('VSHN - the DevOps Company');

    cy.get('#id').clear().type('-1-vshn');
    cy.get('.p-error').should('be.visible').and('contain.text', 'organization ID');
    cy.get('button[type=submit]').should('be.disabled');

    cy.get('#id').clear();
    cy.get('.p-error').should('not.exist');

    cy.get('#id').clear().type('1-vshn-');
    cy.get('.p-error').should('be.visible').and('contain.text', 'organization ID');
    cy.get('button[type=submit]').should('be.disabled');

    cy.get('#id').clear();
    cy.get('.p-error').should('not.exist');

    cy.get('#id').clear().type('VSHN');
    cy.get('.p-error').should('be.visible').and('contain.text', 'organization ID');
    cy.get('button[type=submit]').should('be.disabled');

    cy.get('#id').clear();
    cy.get('.p-error').should('not.exist');

    cy.get('#id').clear().type('vshn 1');
    cy.get('.p-error').should('be.visible').and('contain.text', 'organization ID');
    cy.get('button[type=submit]').should('be.disabled');

    cy.get('#id').clear();
    cy.get('.p-error').should('not.exist');

    cy.get('#id').clear().type('vshn_1');
    cy.get('.p-error').should('be.visible').and('contain.text', 'organization ID');
    cy.get('button[type=submit]').should('be.disabled');
  });

  it('no create permission', () => {
    cy.setPermission({ verb: 'list', ...OrganizationPermissions }, { verb: 'list', ...BillingEntityPermissions });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: { items: [] },
    });
    cy.visit('/organizations');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get('#no-organization-message').should('contain.text', 'No organizations available.');
    cy.get('#addOrganizationButton').should('not.exist');
  });
  it('no list billing permission', () => {
    cy.setPermission({ verb: 'list', ...OrganizationPermissions }, { verb: 'create', ...OrganizationPermissions });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: { items: [] },
    });
    cy.visit('/organizations');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get('#no-organization-message').should('contain.text', 'No organizations available.');
    cy.get('#addOrganizationButton').should('not.exist');
  });
});
