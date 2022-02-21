describe('Test zones', () => {
  before(() => {
    cy.setupAuth();
    window.localStorage.removeItem('hideFirstTimeLoginDialog');
  });
  it('join organization', () => {
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations?limit=1', {
      fixture: 'organizations-empty.json',
    });
    cy.visit('/');
    cy.get('.p-dialog-header').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
    cy.get('#joinOrganizationDialogButton').click();
    cy.get('.p-dialog-header').should('contain.text', 'Join Organization');
  });

  it('add organization', () => {
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations?limit=1', {
      fixture: 'organizations-empty.json',
    });
    cy.visit('/');
    cy.get('.p-dialog-header').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
    cy.get('#addOrganizationDialogButton').click();
    cy.get('.text-3xl > .ng-star-inserted').should('contain.text', 'New Organization');
  });

  it('do not show dialog', () => {
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations?limit=1', {
      fixture: 'organizations.json',
    });
    cy.visit('/');
    cy.get('.p-dialog-header').should('not.exist');
  });

  it('do not show dialog again', () => {
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations?limit=1', {
      fixture: 'organizations-empty.json',
    });
    cy.visit('/');
    cy.get('.p-dialog-header').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
    cy.get('label[for=hideFirstTimeLoginDialogCheckbox]').click();
    cy.get('#addOrganizationDialogButton').click();
    cy.get('.text-3xl > .ng-star-inserted').should('contain.text', 'New Organization');
    cy.visit('/references');
    cy.get('#references-title').should('contain.text', 'References');
    cy.get('.p-dialog-header').should('not.exist');
  });
});
