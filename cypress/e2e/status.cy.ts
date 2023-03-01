import { zoneCloudscale1, zoneCloudscale2 } from '../fixtures/zone';
import { createUser } from '../fixtures/user';
import { ZonePermissions } from '../../src/app/types/zone';

describe('Test zones', () => {
  beforeEach(() => {
    cy.setupAuth();
    cy.disableCookieBanner();
  });
  beforeEach(() => {
    cy.setPermission({ verb: 'list', ...ZonePermissions });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones', {
      body: { items: [zoneCloudscale1, zoneCloudscale2] },
    });
  });
  beforeEach(() => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', ...ZonePermissions });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'nxt' }),
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
    cy.get('app-status-badge .p-tag-success').should('exist');
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
    cy.get('app-status-badge .p-tag-info').should('exist');
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
    cy.get('app-status-badge .p-tag-danger').should('exist');
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
    cy.get('app-status-badge .p-tag-warning').should('exist');
  });
});
