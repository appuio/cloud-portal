import { createUser } from '../fixtures/user';
import { OrganizationPermissions } from '../../src/app/types/organization';
import { BillingEntityPermissions } from '../../src/app/types/billing-entity';
import {
  organizationListNxtVshnWithDisplayName,
  organizationNxt,
  organizationVshn,
  setOrganization,
} from '../fixtures/organization';
import { OrganizationMembersPermissions } from '../../src/app/types/organization-members';
import { billingEntityNxt, billingEntityVshn, setBillingEntities } from '../fixtures/billingentities';
import { ZonePermissions } from '../../src/app/types/zone';
import { zoneCloudscale1 } from '../fixtures/zone';

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
      { verb: 'list', ...OrganizationMembersPermissions, namespace: organizationVshn.metadata.name }
    );

    setOrganization(cy, organizationNxt);
    setBillingEntities(cy, billingEntityNxt, billingEntityVshn);

    cy.intercept('POST', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationVshn,
      statusCode: 201,
    }).as('add');
    cy.visit('/organizations');
    cy.get('#organizations-title').should('contain.text', 'Organizations');

    cy.get('#addOrganizationButton').click();

    cy.get('#displayName').type('VSHN - the DevOps Company ');
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
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'VSHN - the DevOps Company');
    cy.get(':nth-child(3) > .border-top-1 > .list-none > .flex > .text-900').should(
      'contain.text',
      'VSHN - the DevOps Company'
    );
    cy.get(':nth-child(3) > .flex-row [title="Edit organization"]').should('exist');
    cy.get(':nth-child(3) > .flex-row [title="Edit members"]').should('exist');
  });

  it('add organization for first-time', () => {
    cy.setPermission(
      { verb: 'list', ...OrganizationPermissions },
      { verb: 'create', ...OrganizationPermissions },
      { verb: 'list', ...BillingEntityPermissions },
      { verb: 'list', ...ZonePermissions },
      { verb: 'update', ...OrganizationPermissions, namespace: organizationVshn.metadata.name },
      { verb: 'list', ...OrganizationMembersPermissions, namespace: organizationVshn.metadata.name }
    );

    setOrganization(cy, organizationNxt);
    setBillingEntities(cy, billingEntityNxt);
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones', {
      body: { items: [zoneCloudscale1] },
    });

    cy.intercept('POST', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationVshn,
    }).as('add');
    cy.visit('/organizations/$new?firstTime=y');
    cy.get('#title').should('contain.text', 'New Organization');

    cy.get('#id').type('nxt');
    cy.get('#selectedBillingEntity').should('contain.text', 'Engineering');
    cy.get('button[type=submit]').click();
    cy.wait('@add');
    cy.url().should('contain', '/zones');
    cy.get('#zones-title').should('contain.text', 'Zones');
  });

  it('add organization with invalid id', () => {
    cy.setPermission(
      { verb: 'list', ...OrganizationPermissions },
      { verb: 'create', ...OrganizationPermissions },
      { verb: 'list', ...BillingEntityPermissions }
    );
    setOrganization(cy);
    setBillingEntities(cy, billingEntityNxt);
    cy.visit('/organizations/$new');

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
    cy.visit('/organizations/$new');

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
    cy.intercept('PATCH', 'appuio-api/apis/organization.appuio.io/v1/organizations/vshn', {
      body: organizationVshn,
      statusCode: 200,
    }).as('update');
    cy.get('#organizations-title').should('contain.text', 'Organizations');

    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'nxt');
    cy.get(':nth-child(2) > .border-top-1 > .list-none > .flex > .text-900').should(
      'contain.text',
      'nxt Engineering GmbH'
    );
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'VSHN AG');
    cy.get(':nth-child(3) > .border-top-1 > .list-none > .flex > .text-900').should('contain.text', 'VSHN AG');

    cy.get(':nth-child(2) > .flex-row [title="Edit organization"]').should('not.exist');
    cy.get(':nth-child(3) > .flex-row [title="Edit organization"]').click();
    cy.get('#title').should('contain.text', 'vshn');
    cy.get('#selectedBillingEntity').should('contain.text', '👁️ AG');
    cy.get('#displayName').type('{selectall}');
    cy.get('#displayName').type('VSHN - the DevOps Company  ');
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
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'nxt Engineering GmbH');
    cy.get(':nth-child(2) > .border-top-1 > .list-none > .flex > .text-900').should(
      'contain.text',
      'nxt Engineering GmbH'
    );
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'VSHN - the DevOps Company');
    cy.get(':nth-child(3) > .border-top-1 > .list-none > .flex > .text-900').should(
      'contain.text',
      'VSHN - the DevOps Company'
    );
  });
});
