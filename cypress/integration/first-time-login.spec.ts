describe('Test First Time Login', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.removeItem('hideFirstTimeLoginDialog');
  });
  it('join organization', () => {
    cy.setPermission({ verb: 'list', resource: 'organizationmembers', group: 'rbac.appuio.io' });
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/organizationmembers', {
      fixture: 'organization-members-list-empty.json',
    });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organization-list-empty.json',
    });
    cy.visit('/');
    cy.get('.p-dialog-header').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
    cy.get('#joinOrganizationDialogButton').click();
    cy.get('.p-dialog-header').should('contain.text', 'Join Organization');
  });

  it('add organization', () => {
    cy.setPermission({ verb: 'list', resource: 'organizationmembers', group: 'rbac.appuio.io' });
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/organizationmembers', {
      fixture: 'organization-members-list-empty.json',
    });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organization-list-empty.json',
    });
    cy.visit('/');
    cy.get('.p-dialog-header').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
    cy.get('#addOrganizationDialogButton').click();
    cy.get('.text-3xl > .ng-star-inserted').should('contain.text', 'New Organization');
  });

  it('do not show dialog', () => {
    cy.setPermission({ verb: 'list', resource: 'organizationmembers', group: 'rbac.appuio.io' });
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/organizationmembers', {
      fixture: 'organization-members-list.json',
    });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organization-list.json',
    });
    cy.visit('/');
    cy.get('.p-dialog-header').should('not.exist');
  });

  it('do not show dialog again', () => {
    cy.setPermission({ verb: 'list', resource: 'organizationmembers', group: 'rbac.appuio.io' });
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/organizationmembers', {
      fixture: 'organization-members-list-empty.json',
    });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organization-list-empty.json',
    });
    cy.visit('/');
    cy.get('#joinOrganizationDialogButton').should('exist');
    cy.get('#addOrganizationDialogButton').should('exist');

    cy.get('label[for=hideFirstTimeLoginDialogCheckbox]').click();
    cy.get('#addOrganizationDialogButton').click();
    cy.get('.text-3xl > .ng-star-inserted').should('contain.text', 'New Organization');
    cy.visit('/references');
    cy.get('#references-title').should('contain.text', 'References');
    cy.get('.p-dialog-header').should('not.exist');
  });

  it('show dialog because no organization contains current username', () => {
    cy.setPermission({ verb: 'list', resource: 'organizationmembers', group: 'rbac.appuio.io' });
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/organizationmembers', {
      fixture: 'organization-members-list-empty.json',
    });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organization-list.json',
    });
    cy.visit('/');
    cy.get('#joinOrganizationDialogButton').should('exist');
    cy.get('#addOrganizationDialogButton').should('exist');
  });

  it('show dialog because no organization contains current username and no userRefs', () => {
    cy.setPermission({ verb: 'list', resource: 'organizationmembers', group: 'rbac.appuio.io' });
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/organizationmembers', {
      fixture: 'organization-members-list-no-userRefs.json',
    });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organization-list.json',
    });
    cy.visit('/');
    cy.get('#joinOrganizationDialogButton').should('exist');
    cy.get('#addOrganizationDialogButton').should('exist');
  });

  it('do not show dialog because one organization contains current username', () => {
    cy.setPermission({ verb: 'list', resource: 'organizationmembers', group: 'rbac.appuio.io' });
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/organizationmembers', {
      fixture: 'organization-members-list.json',
    });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organization-list.json',
    });
    cy.visit('/');
    cy.get('.p-dialog-header').should('not.exist');
  });
});
