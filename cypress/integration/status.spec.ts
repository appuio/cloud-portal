describe('Test zones', () => {
  before(() => {
    cy.setupAuth();
  });
  beforeEach(() => {
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones', {
      fixture: 'zones.json',
    });
  });
  it('success', () => {
    cy.intercept('GET', 'https://statuspal.eu/api/v1/status_pages/appuio-cloud/status', {
      body: {
        status_page: {
          current_incident_type: null,
        },
      },
    });
    cy.visit('/');
    cy.get('#status > .p-tag-success').should('exist');
  });
  it('scheduled', () => {
    cy.intercept('GET', 'https://statuspal.eu/api/v1/status_pages/appuio-cloud/status', {
      body: {
        status_page: {
          current_incident_type: 'scheduled',
        },
      },
    });
    cy.visit('/');
    cy.get('#status > .p-tag-info').should('exist');
  });
  it('major', () => {
    cy.intercept('GET', 'https://statuspal.eu/api/v1/status_pages/appuio-cloud/status', {
      body: {
        status_page: {
          current_incident_type: 'major',
        },
      },
    });
    cy.visit('/');
    cy.get('#status > .p-tag-danger').should('exist');
  });
  it('minor', () => {
    cy.intercept('GET', 'https://statuspal.eu/api/v1/status_pages/appuio-cloud/status', {
      body: {
        status_page: {
          current_incident_type: 'minor',
        },
      },
    });
    cy.visit('/');
    cy.get('#status > .p-tag-warning').should('exist');
  });
});
