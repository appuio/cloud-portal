import { createUser } from '../fixtures/user';
import { organizationListNxtVshn, setOrganization } from '../fixtures/organization';
import { OrganizationPermissions } from '../../src/app/types/organization';
import { createOrganizationMembers } from '../fixtures/organization-members';
import { OrganizationMembersPermissions } from '../../src/app/types/organization-members';
import { InvitationPermissions } from '../../src/app/types/invitation';

describe('Test First Time Login', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.removeItem('hideFirstTimeLoginDialog');
    cy.disableCookieBanner();
  });
  beforeEach(() => {
    // needed for initial getUser request
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'nxt' }),
    });
  });

  it('join organization', () => {
    cy.setPermission({ verb: 'list', ...OrganizationPermissions });
    setOrganization(cy);
    cy.visit('/');
    cy.get('.p-dialog-header').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
    cy.get('#joinOrganizationDialogButton').click();
    cy.get('.p-dialog-header').should('contain.text', 'Join Organization');
  });
  // some requirements may change, see https://github.com/appuio/cloud-portal/issues/438, skipping until it's clear.
  it.skip('add organization', () => {
    cy.setPermission({ verb: 'list', ...OrganizationPermissions });
    setOrganization(cy);
    cy.visit('/');
    cy.get('.p-dialog-header').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
    cy.get('#addOrganizationDialogButton').click();
    cy.get('.text-3xl > .ng-star-inserted').should('contain.text', 'New Organization');
  });

  it('do not show dialog', () => {
    cy.setPermission(
      { verb: 'list', resource: 'organizationmembers', group: 'rbac.appuio.io' },
      { verb: 'list', ...OrganizationPermissions }
    );
    setOrganization(cy, ...organizationListNxtVshn.items);
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

  it('do not show dialog when redeeming invitations', () => {
    cy.setPermission(
      { verb: 'list', ...OrganizationMembersPermissions },
      { verb: 'list', ...OrganizationPermissions },
      { verb: 'list', ...InvitationPermissions }
    );
    setOrganization(cy);
    cy.visit('/invitations/uuid');
    cy.get('#title').should('contain.text', 'Invitation');
    cy.get('.p-dialog-header').should('not.exist');
  });

  // some requirements may change, see https://github.com/appuio/cloud-portal/issues/438, skipping until it's clear.
  it.skip('do not show dialog again', () => {
    cy.setPermission({ verb: 'list', ...OrganizationPermissions });
    setOrganization(cy);
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
    cy.setPermission(
      { verb: 'list', resource: 'organizationmembers', group: 'rbac.appuio.io' },
      { verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' }
    );
    setOrganization(cy, ...organizationListNxtVshn.items);

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
    cy.get('#setDefaultOrganizationDialogButton').should('not.exist');
  });

  it('show dialog with button to set default org because user has no default organization yet', () => {
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig' }),
    }).as('getUser');
    cy.setPermission(
      { verb: 'list', resource: 'organizationmembers', group: 'rbac.appuio.io' },
      { verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' }
    );
    setOrganization(cy, ...organizationListNxtVshn.items);
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/organizationmembers/members', {
      body: createOrganizationMembers({
        namespace: 'nxt',
        userRefs: [{ name: 'mig' }],
      }),
    });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/vshn/organizationmembers/members', {
      body: createOrganizationMembers({
        namespace: 'vshn',
        userRefs: [{ name: 'tobru' }, { name: 'corvus' }],
      }),
    });
    cy.visit('/');
    cy.get('#joinOrganizationDialogButton').should('not.exist');
    cy.get('#addOrganizationDialogButton').should('not.exist');
    cy.get('#setDefaultOrganizationDialogButton').should('exist');
  });
});
