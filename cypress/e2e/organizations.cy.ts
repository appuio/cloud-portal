import { createUser } from '../fixtures/user';
import { organizationListNxtVshn, organizationVshn, setOrganization } from '../fixtures/organization';
import { OrganizationPermissions } from '../../src/app/types/organization';
import { BillingEntityPermissions } from '../../src/app/types/billing-entity';
import { setBillingEntities } from '../fixtures/billingentities';

describe.skip('Test organization list', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
    cy.disableCookieBanner();
  });
  beforeEach(() => {
    cy.setPermission({ verb: 'list', ...OrganizationPermissions });
    // needed for initial getUser request
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'nxt' }),
    });
  });

  it('list with two entries', () => {
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.visit('/organizations');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'nxt');
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'vshn');
  });

  it('empty list', () => {
    setOrganization(cy);
    cy.visit('/organizations');
    cy.wait('@organizationList');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get('#no-organization-message').should('contain.text', 'No organizations available.');
  });

  it('request failed', () => {
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      statusCode: 403,
    });
    cy.visit('/organizations');
    cy.get('#failure-message').should('contain.text', 'Organizations could not be loaded.');
  });

  it('failed requests are retried', () => {
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

    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'nxt');
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'vshn');
  });
});

describe('Test limited permissions', () => {
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

  it('no organization list permission', () => {
    cy.setPermission();
    cy.visit('/organizations');
    cy.get('h1').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
  });

  it('no organization create permission', () => {
    cy.setPermission({ verb: 'list', ...OrganizationPermissions });
    setOrganization(cy);
    setBillingEntities(cy);

    cy.visit('/organizations');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get('#no-organization-message').should('contain.text', 'No organizations available.');
    cy.get('#addOrganizationButton').should('not.exist');
  });

  it('no organization edit permission', () => {
    cy.setPermission({ verb: 'list', ...OrganizationPermissions }, { verb: 'list', ...BillingEntityPermissions });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.visit('/organizations');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get(':nth-child(3) > .flex-row > .text-blue-500 > .ng-fa-icon').should('not.exist');
  });

  it('should show empty list if no billing list permissions', () => {
    cy.setPermission({ verb: 'list', ...OrganizationPermissions });
    setOrganization(cy);

    cy.visit('/organizations');
    cy.get('#no-organization-message').should('contain.text', 'No organizations available.');
  });

  it('should hide billing button if no billing list permission', () => {
    cy.setPermission(
      { verb: 'list', ...OrganizationPermissions },
      { verb: 'update', ...OrganizationPermissions, namespace: organizationVshn.metadata.name }
    );

    setBillingEntities(cy);
    setOrganization(cy, organizationVshn);
    cy.visit('/organizations');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get(':nth-child(3) > .flex-row > .text-blue-500 > .ng-fa-icon').should('not.exist');
  });
});
