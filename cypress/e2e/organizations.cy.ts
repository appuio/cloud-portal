import { createUser } from '../fixtures/user';
import {
  organizationListNxtVshn,
  organizationListNxtVshnWithDisplayName,
  organizationVshn,
  setOrganization,
} from '../fixtures/organization';
import { OrganizationPermissions } from '../../src/app/types/organization';
import { BillingEntityPermissions } from '../../src/app/types/billing-entity';
import { billingEntityNxt, billingEntityVshn, setBillingEntities } from '../fixtures/billingentities';

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
    setOrganization(cy);
    cy.visit('/organizations');
    cy.wait('@organizationList');
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
    cy.get('#failure-message').should('contain.text', 'Organizations could not be loaded.');
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
    cy.intercept('POST', 'appuio-api/apis/authorization.k8s.io/v1/selfsubjectaccessreviews', {
      body: { spec: { resourceAttributes: { resource: '', group: '', verb: '' } }, status: { allowed: false } },
    });
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

    setBillingEntities(cy, billingEntityVshn, billingEntityNxt);

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
    cy.get('#selectedBillingEntity').should('contain.text', '👁️ AG');
    cy.get('#displayName').type('{selectall}');
    cy.get('#displayName').type('VSHN - the DevOps Company');
    cy.get('#selectedBillingEntity').click().contains('➡️ Engineering GmbH').click();
    cy.get('button[type=submit]').click();
    cy.wait('@update');
    cy.get('@update')
      .its('request.body')
      .then((body) => {
        expect(body.metadata.name).to.eq('vshn');
        expect(body.spec.displayName).to.eq('VSHN - the DevOps Company');
        expect(body.spec.billingEntityRef).to.eq('be-2345');
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

    setBillingEntities(cy);
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

    setOrganization(cy);
    setBillingEntities(cy, billingEntityNxt, billingEntityVshn);

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
    const button = cy.get('button[type=submit]');
    button.should('be.disabled');

    cy.get('#selectedBillingEntity').click();
    cy.get('#selectedBillingEntity').find('ul li').eq(1).click();
    button.click();
    cy.wait('@add');
    cy.get('@add')
      .its('request.body')
      .then((body) => {
        expect(body.metadata.name).to.eq('vshn-the-dev-ops-company');
        expect(body.spec.displayName).to.eq('VSHN - the DevOps Company');
        expect(body.spec.billingEntityRef).to.eq('be-2347');
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
    setOrganization(cy);
    setBillingEntities(cy, billingEntityNxt);
    cy.visit('/organizations');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get('#no-organization-message').should('contain.text', 'No organizations available.');

    cy.get('#addOrganizationButton').click();
    cy.get('#selectedBillingEntity').click().contains('Engineering').click();

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
    setOrganization(cy);
    setBillingEntities(cy, billingEntityNxt);
    cy.visit('/organizations');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get('#no-organization-message').should('contain.text', 'No organizations available.');

    cy.get('#addOrganizationButton').click();

    cy.get('#displayName').type('VSHN - the DevOps Company');
    cy.get('#selectedBillingEntity').click().contains('Engineering').click();

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
    setOrganization(cy);
    setBillingEntities(cy);

    cy.visit('/organizations');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get('#no-organization-message').should('contain.text', 'No organizations available.');
    cy.get('#addOrganizationButton').should('not.exist');
  });
  it('no list billing permission', () => {
    cy.setPermission({ verb: 'list', ...OrganizationPermissions }, { verb: 'create', ...OrganizationPermissions });
    setOrganization(cy);

    cy.visit('/organizations');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get('#no-organization-message').should('contain.text', 'No organizations available.');
    cy.get('#addOrganizationButton').should('not.exist');
  });
});
