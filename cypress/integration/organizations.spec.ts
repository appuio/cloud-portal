describe('Test organization list', () => {
  before(() => {
    cy.setupAuth();
  });
  it('list with two entries', () => {
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' });
    cy.visit('/organizations');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organizations.json',
    });
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'nxt');
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'vshn');
  });
  it('empty list', () => {
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' });
    cy.visit('/organizations');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organizations-empty.json',
    });
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get('#no-organization-message').should('contain.text', 'No organizations available.');
  });

  it('request failed', () => {
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' });
    cy.visit('/organizations');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      statusCode: 403,
    });
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get('#organization-failure-message').should('contain.text', 'Organizations could not be loaded.');
  });

  it('no permission', () => {
    cy.visit('/organizations');
    cy.get('h1').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
  });
});

describe('Test organization edit', () => {
  before(() => {
    cy.setupAuth();
  });
  it('edit organization with button', () => {
    cy.setPermission(
      { verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' },
      { verb: 'update', resource: 'organizations', group: 'rbac.appuio.io', namespace: 'vshn' }
    );
    cy.visit('/organizations');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organizations.json',
    });
    cy.intercept('PUT', 'appuio-api/apis/organization.appuio.io/v1/organizations/vshn', {
      fixture: 'organization-update.json',
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
    cy.get('#displayName').type('{selectall}');
    cy.get('#displayName').type('VSHN - the DevOps Company');
    cy.get('button[type=submit]').click();
    cy.get('@update')
      .its('request.body')
      .then((body) => {
        expect(body.metadata.name).to.eq('vshn');
        expect(body.spec.displayName).to.eq('VSHN - the DevOps Company');
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
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' });
    cy.visit('/organizations');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organizations.json',
    });
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get(':nth-child(3) > .flex-row > .text-blue-500 > .ng-fa-icon').should('not.exist');
  });
});

describe('Test organization add', () => {
  before(() => {
    cy.setupAuth();
  });
  it('add organization with button', () => {
    cy.setPermission(
      { verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' },
      { verb: 'create', resource: 'organizations', group: 'rbac.appuio.io' },
      { verb: 'update', resource: 'organizations', group: 'rbac.appuio.io' }
    );
    cy.visit('/organizations');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organizations-empty.json',
    });
    cy.intercept('POST', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organization-update.json',
      statusCode: 201,
    }).as('add');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get('#no-organization-message').should('contain.text', 'No organizations available.');

    cy.get('#addOrganizationButton').click();

    cy.get('#name').type('vshn');
    cy.get('#displayName').type('VSHN - the DevOps Company');
    cy.get('button[type=submit]').click();
    cy.get('@add')
      .its('request.body')
      .then((body) => {
        expect(body.metadata.name).to.eq('vshn');
        expect(body.spec.displayName).to.eq('VSHN - the DevOps Company');
      });
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'vshn');
    cy.get(':nth-child(2) > .border-top-1 > .list-none > .flex > .text-900').should(
      'contain.text',
      'VSHN - the DevOps Company'
    );
    cy.get(':nth-child(2) > .flex-row [title="Edit organization"]').should('exist');
    cy.get(':nth-child(2) > .flex-row [title="Edit members"]').should('exist');
  });
  it('no create permission', () => {
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'rbac.appuio.io' });
    cy.visit('/organizations');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
      fixture: 'organizations-empty.json',
    });
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get('#no-organization-message').should('contain.text', 'No organizations available.');
    cy.get('#addOrganizationButton').should('not.exist');
  });
});
