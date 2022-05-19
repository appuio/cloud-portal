import { createUser } from '../fixtures/user';
import { createOrganizationList, organizationListNxtVshn } from '../fixtures/organization';
import { createOrganizationMembers } from '../fixtures/organization-members';

describe('Test First Time Login', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.removeItem('hideFirstTimeLoginDialog');
  });
  beforeEach(() => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'nxt' }),
    });
  });

  it('join organization', () => {
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: createOrganizationList({ items: [] }),
    });
    cy.visit('/');
    cy.get('.p-dialog-header').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
    cy.get('#joinOrganizationDialogButton').click();
    cy.get('.p-dialog-header').should('contain.text', 'Join Organization');
  });

  it('add organization', () => {
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: createOrganizationList({ items: [] }),
    });
    cy.visit('/');
    cy.get('.p-dialog-header').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
    cy.get('#addOrganizationDialogButton').click();
    cy.get('.text-3xl > .ng-star-inserted').should('contain.text', 'New Organization');
  });

  it('do not show dialog', () => {
    cy.setPermission({ verb: 'list', resource: 'organizationmembers', group: 'rbac.appuio.io' });
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/organizationmembers/members', {
      body: createOrganizationMembers({
        namespace: 'nxt',
        userRefs: [{ name: 'mig' }, { name: 'miw' }],
      }),
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/vshn/organizationmembers/members', {
      body: createOrganizationMembers({
        namespace: 'vshn',
        userRefs: [{ name: 'tobru' }, { name: 'corvus' }],
      }),
    });
    cy.visit('/');
    cy.get('.p-dialog-header').should('not.exist');
  });

  it('do not show dialog again', () => {
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: createOrganizationList({ items: [] }),
    });
    cy.visit('/');
    cy.get('#joinOrganizationDialogButton').should('exist');
    cy.get('#addOrganizationDialogButton').should('exist');

    cy.get('label[for=hideFirstTimeLoginDialogCheckbox]').click();
    cy.get('#addOrganizationDialogButton').click();
    cy.get('.text-3xl > .ng-star-inserted').should('contain.text', 'New Organization');
    cy.visit('/teams');
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get('.p-dialog-header').should('not.exist');
  });

  it('show dialog because no organization contains current username', () => {
    cy.setPermission({ verb: 'list', resource: 'organizationmembers', group: 'rbac.appuio.io' });
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/organizationmembers/members', {
      body: createOrganizationMembers({
        namespace: 'nxt',
        userRefs: [{ name: 'miw' }],
      }),
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/vshn/organizationmembers/members', {
      body: createOrganizationMembers({
        namespace: 'vshn',
        userRefs: [{ name: 'tobru' }, { name: 'corvus' }],
      }),
    });
    cy.visit('/');
    cy.get('#joinOrganizationDialogButton').should('exist');
    cy.get('#addOrganizationDialogButton').should('exist');
  });
});
