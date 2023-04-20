import { createUser, userMigWithoutPreferences } from '../fixtures/user';
import { organizationListNxtVshn, setOrganization } from '../fixtures/organization';
import { createOrganizationMembers, setOrganizationMembers } from '../fixtures/organization-members';
import { teamListNxt, teamListVshn } from '../fixtures/team';
import { TeamPermissions } from '../../src/app/types/team';

describe('Test user', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
    cy.disableCookieBanner();
    cy.setPermission();
  });

  it('without preferences', () => {
    // needed for initial getUser request
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    setOrganizationMembers(cy, 'nxt', 'mig');
    setOrganizationMembers(cy, 'vshn', 'mig');

    cy.visit('/user');
    cy.get('.p-dropdown-label').should('contain.text', 'None');
  });

  it('with preferences (default organization)', () => {
    // needed for initial getUser request
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
    setOrganization(cy, ...organizationListNxtVshn.items);

    cy.visit('/user');
    cy.get('.p-dropdown-label').should('contain.text', 'nxt Engineering GmbH (nxt)');
  });

  it('with change of default organization to vshn', () => {
    // needed for initial getUser request
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'nxt' }),
    });
    cy.intercept('PATCH', 'appuio-api/apis/appuio.io/v1/users/mig', {
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
    setOrganization(cy, ...organizationListNxtVshn.items);

    cy.visit('/user');
    cy.get('.p-dropdown-label').should('contain.text', 'nxt Engineering GmbH (nxt)');
    cy.get('p-dropdown').click().contains('VSHN').click();
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'vshn' }),
    });
    cy.get('button[type=submit]').click();
    cy.wait('@putUser');
    cy.get('.p-dropdown-label').should('contain.text', 'vshn');
  });

  it('with update of focus organization', () => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', namespace: 'nxt', ...TeamPermissions });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'nxt' }),
    });
    cy.intercept('PATCH', 'appuio-api/apis/appuio.io/v1/users/mig', {
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
    setOrganization(cy, ...organizationListNxtVshn.items);
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/teams', {
      body: teamListNxt,
    });

    cy.visit('/teams');
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'team1');
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'team2');

    cy.visit('/user');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.get('.p-dropdown-label').should('contain.text', 'nxt Engineering GmbH (nxt)');
    cy.get('p-dropdown').click().contains('VSHN').click();
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'vshn' }),
    });
    cy.get('button[type=submit]').click();
    cy.wait('@putUser');
    cy.get('.p-dropdown-label').should('contain.text', 'vshn');

    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/vshn/teams', {
      body: teamListVshn,
    });
    cy.visit('/teams');
    cy.get('#teams-title').should('contain.text', 'Teams');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'tarazed');
  });

  it('with change of default organization to None', () => {
    // needed for initial getUser request
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'nxt' }),
    });
    cy.intercept('PATCH', 'appuio-api/apis/appuio.io/v1/users/mig', {
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
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      body: organizationListNxtVshn,
    });
    cy.visit('/user');
    cy.get('.p-dropdown-label').should('contain.text', 'nxt Engineering GmbH (nxt)');
    cy.get('.p-dropdown-clear-icon').click();
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: userMigWithoutPreferences,
    });

    cy.get('button[type=submit]').click();
    cy.wait('@putUser');
    cy.get('.p-dropdown-label').should('contain.text', 'None');
  });
});

describe('Test failures', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
    cy.disableCookieBanner();
    cy.setPermission();
  });

  it('load user failed', () => {
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      statusCode: 403,
    });
    setOrganization(cy);
    cy.visit('/user');

    cy.get('#failure-message').should('contain.text', 'User settings could not be loaded.');
  });
});
