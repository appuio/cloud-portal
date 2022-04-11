import { createUser, userMigWithoutPreferences } from '../fixtures/user';
import { organizationListNxtVshn } from '../fixtures/organization';
import { createOrganizationMembers } from '../fixtures/organization-members';

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
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/vshn/organizationmembers/members', {
      body: createOrganizationMembers({
        namespace: 'vshn',
        userRefs: [{ name: 'mig' }],
      }),
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/organizationmembers/members', {
      body: createOrganizationMembers({
        namespace: 'nxt',
        userRefs: [{ name: 'mig' }],
      }),
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
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/vshn/organizationmembers/members', {
      body: createOrganizationMembers({
        namespace: 'vshn',
        userRefs: [{ name: 'mig' }],
      }),
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/organizationmembers/members', {
      body: createOrganizationMembers({
        namespace: 'nxt',
        userRefs: [{ name: 'mig' }],
      }),
    });

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
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/vshn/organizationmembers/members', {
      body: createOrganizationMembers({
        namespace: 'vshn',
        userRefs: [{ name: 'mig' }],
      }),
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/organizationmembers/members', {
      body: createOrganizationMembers({
        namespace: 'nxt',
        userRefs: [{ name: 'mig' }],
      }),
    });

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
