describe('Test zones', () => {
  before(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', String(new Date().getTime()));
  });
  it('list with two entries', () => {
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'appuio.io' });
    cy.visit('/zones');
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones', {
      fixture: 'zones.json',
    });
    cy.get('#zones-title').should('contain.text', 'Zones');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'cloudscale.ch LPG 0');
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'cloudscale.ch LPG 2');
  });

  it('empty list', () => {
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'appuio.io' });
    cy.visit('/zones');
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones', {
      fixture: 'zones-empty.json',
    });
    cy.get('#zones-title').should('contain.text', 'Zones');
    cy.get('#no-zone-message').should('contain.text', 'No zones available.');
  });

  it('request failed', () => {
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'appuio.io' });
    cy.visit('/zones');
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones', {
      statusCode: 403,
    });
    cy.get('#zones-title').should('contain.text', 'Zones');
    cy.get('#zone-failure-message').should('contain.text', 'Zones could not be loaded.');
  });

  it('no permission', () => {
    cy.visit('/zones');
    cy.get('h1').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
  });
});
