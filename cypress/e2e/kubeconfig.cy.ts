import * as path from 'path';

describe('Test kubeconfig', () => {
  beforeEach(() => {
    cy.setupAuth();
    cy.disableCookieBanner();
  });
  beforeEach(() => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });
  });

  it('shows kubeconfig', () => {
    cy.visit('/kubeconfig');
    cy.get('#kubeconfig-title').should('contain.text', 'Connect to APPUiO Control API');
    cy.get('[data-cy=kubeconfig]').should('not.be.empty').should('contain.text', '--oidc-client-id=local-dev');
  });

  it('downloads the kubeconfig', () => {
    const downloadsFolder = Cypress.config('downloadsFolder');

    cy.visit('/kubeconfig');
    cy.get('#kubeconfig-title').should('contain.text', 'Connect to APPUiO Control API');
    cy.get('[title="Download Kubeconfig"]').should('have.attr', 'href');
    cy.get('[title="Download Kubeconfig"]')
      .should('have.attr', 'download')
      .then((filename) => {
        cy.get('[title="Download Kubeconfig"]').click();
        // dispite what TS says, cy.should('have.attr') actually returns the attribute value as string and not an HTMLElement, hence this ugly cast
        // https://docs.cypress.io/api/commands/should#Method-and-Value
        cy.readFile(path.join(downloadsFolder, filename as unknown as string), { timeout: 15000 }).should(
          'have.length.gt',
          50
        );
      });
  });
});
