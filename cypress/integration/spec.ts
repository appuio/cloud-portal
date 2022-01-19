describe('Visit page', () => {
  before(() => {
    cy.setupAuth();
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones', {fixture: 'zones.json'});
  });
  it('Visits the initial project page', () => {
    cy.visit('/');
    cy.title().should('eq', 'APPUiO Cloud Portal');
    cy.get('#title').should('contain.text', 'Zones');
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'cloudscale.ch LPG 0');
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'cloudscale.ch LPG 2');
  });
});
