describe('Test zones', () => {
  before(() => {
    cy.setupAuth();
  });
  beforeEach(() => {
    cy.visit('/');
    cy.title().should('eq', 'APPUiO Cloud Portal');
  });
  it('list with two entries', () => {
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones', {
      fixture: 'zones.json',
    });
    cy.get('#zones-title').should('contain.text', 'Zones');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should(
      'contain.text',
      'cloudscale.ch LPG 0'
    );
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should(
      'contain.text',
      'cloudscale.ch LPG 2'
    );
  });

  it('empty list', () => {
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones', {
      fixture: 'zones-empty.json',
    });
    cy.get('#zones-title').should('contain.text', 'Zones');
    cy.get('#no-zone-message').should('contain.text', 'No zones available.');
  });

  it('request failed', () => {
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones', {
      statusCode: 403,
    });
    cy.get('#zones-title').should('contain.text', 'Zones');
    cy.get('#zone-failure-message').should(
      'contain.text',
      'Zones could not be loaded.'
    );
  });
});
