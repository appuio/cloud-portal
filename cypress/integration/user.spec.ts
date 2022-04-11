import { createUser, userMigWithoutPreferences } from '../fixtures/user';
import { organizationListNxtVshn } from '../fixtures/organization';

describe('Test user', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
  });

  it('without preferences', () => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });

    cy.visit('/user');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.get('.p-dropdown-label').should('contain.text', 'None');
  });

  it('with preferences (default organization)', () => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'nxt' }),
    });

    cy.visit('/user');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.get('.p-dropdown-label').should('contain.text', 'nxt Engineering GmbH');
  });

  it('with change of default organization to vshn', () => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'nxt' }),
    });
    cy.intercept('PUT', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'vshn' }),
    }).as('putUser');

    cy.visit('/user');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.get('.p-dropdown-label').should('contain.text', 'nxt Engineering GmbH');
    cy.get('.p-dropdown-trigger-icon').click();
    cy.get('#pr_id_4_list > :nth-child(2)').click();
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'vshn' }),
    });
    cy.get('button[type=submit]').click();
    cy.wait('@putUser');
    cy.get('.p-dropdown-label').should('contain.text', 'VSHN AG');
  });

  it('with change of default organization to None', () => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'nxt' }),
    });
    cy.intercept('PUT', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    }).as('putUser');

    cy.visit('/user');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.get('.p-dropdown-label').should('contain.text', 'nxt Engineering GmbH');
    cy.get('.p-dropdown-clear-icon').click();
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });
    cy.get('button[type=submit]').click();
    cy.wait('@putUser');
    cy.get('.p-dropdown-label').should('contain.text', 'None');
  });
});
