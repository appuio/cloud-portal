import { User, UserSpec } from 'src/app/types/user';

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
      fixture: 'organization-list.json',
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
      fixture: 'organization-list.json',
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
    });

    cy.visit('/user');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organization-list.json',
    });
    cy.get('.p-dropdown-label').should('contain.text', 'nxt Engineering GmbH');
    cy.get('.p-dropdown-trigger-icon').click();
    cy.get('#pr_id_4_list > :nth-child(2)').click();
    cy.get('button[type=submit]').click();
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
    });

    cy.visit('/user');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organization-list.json',
    });
    cy.get('.p-dropdown-label').should('contain.text', 'nxt Engineering GmbH');
    cy.get('.p-dropdown-clear-icon').click();
    cy.get('button[type=submit]').click();
    cy.get('.p-dropdown-label').should('contain.text', 'None');
  });
});

export interface UserConfig {
  username: string;
  defaultOrganizationRef?: string;
}

export const userMigWithoutPreferences = createUser({ username: 'mig' });

export function createUser(userConfig: UserConfig): User {
  let spec: UserSpec = {};
  if (userConfig.defaultOrganizationRef) {
    spec = {
      preferences: {
        defaultOrganizationRef: userConfig.defaultOrganizationRef,
      },
    };
  }
  return {
    apiVersion: 'appuio.io/v1',
    kind: 'User',
    metadata: {
      name: userConfig.username,
      resourceVersion: '',
    },
    spec,
  };
}
