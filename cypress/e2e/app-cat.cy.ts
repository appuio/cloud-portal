describe('Test AppCat embed', () => {
  beforeEach(() => {
    cy.setupAuth();
  });
  beforeEach(() => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });
    cy.disableCookieBanner();
  });

  it('shows the application catalog', () => {
    cy.visit('/app-cat');
    cy.get('iframe').children().should('not.be.empty');
  });
});
