describe('Test organization members', () => {
  before(() => {
    cy.setupAuth();
  });
  it('readonly list with two entries', () => {
    cy.setPermission(
      { verb: 'list', resource: 'organizations', group: 'organization.appuio.io' },
      {
        verb: 'list',
        resource: 'organizationmembers',
        group: 'appuio.io',
      }
    );
    cy.visit('/organizations');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', { fixture: 'organizations.json' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/organizationmembers/members', {
      fixture: 'organization-members.json',
    });
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get(':nth-child(2) > .flex-row [title="Edit members"]').click();
    cy.get('.text-3xl').should('contain.text', 'nxt Members');
    cy.get(':nth-child(1) > .p-inputtext').should('have.value', 'hans.meier');
    cy.get(':nth-child(2) > .p-inputtext').should('have.value', 'peter.muster');
    cy.get('button[type=submit]').should('not.exist');
  });

  it('edit list with two entries', () => {
    cy.setPermission(
      { verb: 'list', resource: 'organizations', group: 'organization.appuio.io' },
      { verb: 'list', resource: 'organizationmembers', group: 'appuio.io' },
      { verb: 'update', resource: 'organizationmembers', group: 'appuio.io' }
    );
    cy.visit('/organizations');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', { fixture: 'organizations.json' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/organizationmembers/members', {
      fixture: 'organization-members.json',
    });
    cy.intercept('PUT', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/organizationmembers/members', {
      fixture: 'organization-members.json',
    }).as('save');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get(':nth-child(2) > .flex-row [title="Edit members"]').click();
    cy.get('.text-3xl').should('contain.text', 'nxt Members');
    cy.get(':nth-child(1) > .p-inputtext').should('have.value', 'hans.meier');
    cy.get(':nth-child(2) > .p-inputtext').should('have.value', 'peter.muster');
    cy.get(':nth-child(2) > .p-inputtext').type('{selectall}test');
    cy.get('button[type=submit]').click();
    cy.get('@save')
      .its('request.body')
      .then((body) => {
        expect(body.spec.userRefs[0].name).to.eq('hans.meier');
        expect(body.spec.userRefs[1].name).to.eq('test');
      });
  });

  it('add a new entry', () => {
    cy.setPermission(
      { verb: 'list', resource: 'organizations', group: 'organization.appuio.io' },
      { verb: 'list', resource: 'organizationmembers', group: 'appuio.io' },
      { verb: 'update', resource: 'organizationmembers', group: 'appuio.io' }
    );
    cy.visit('/organizations');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', { fixture: 'organizations.json' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/organizationmembers/members', {
      fixture: 'organization-members.json',
    });
    cy.intercept('PUT', 'appuio-api/apis/appuio.io/v1/namespaces/nxt/organizationmembers/members', {
      fixture: 'organization-members.json',
    }).as('save');
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get(':nth-child(2) > .flex-row [title="Edit members"]').click();
    cy.get('.text-3xl').should('contain.text', 'nxt Members');
    cy.get(':nth-child(1) > .p-inputtext').should('have.value', 'hans.meier');
    cy.get(':nth-child(2) > .p-inputtext').should('have.value', 'peter.muster');
    cy.get(':nth-child(3) > .p-inputtext').type('{selectall}test');
    cy.get('button[type=submit]').click();
    cy.get('@save')
      .its('request.body')
      .then((body) => {
        expect(body.spec.userRefs[0].name).to.eq('hans.meier');
        expect(body.spec.userRefs[1].name).to.eq('peter.muster');
        expect(body.spec.userRefs[2].name).to.eq('test');
      });
  });
  it('no list permission', () => {
    cy.setPermission({ verb: 'list', resource: 'organizations', group: 'organization.appuio.io' });
    cy.visit('/organizations');
    cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', { fixture: 'organizations.json' });
    cy.get('#organizations-title').should('contain.text', 'Organizations');
    cy.get(':nth-child(2) > .flex-row [title="Edit members"]').should('not.exist');
  });
});
