describe('Test Productboard embed', () => {
  beforeEach(() => {
    cy.setupAuth();
  });
  beforeEach(() => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });
    cy.disableCookieBanner();
  });

  it('shows kubeconfig', () => {
    cy.visit('/feedback');
    cy.get('iframe').children().should('not.be.empty');
  });
});
