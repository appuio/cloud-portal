import { createZoneList, zoneCloudscale1, zoneCloudscale2 } from '../fixtures/zone';
import { createUser } from '../fixtures/user';

describe('Test zones', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
  });
  beforeEach(() => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'nxt' }),
    });
  });

  it('list with two entries', () => {
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'appuio.io' });
    cy.visit('/zones');
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones', {
      body: createZoneList({ items: [zoneCloudscale1, zoneCloudscale2] }),
    });
    cy.get('#zones-title').should('contain.text', 'Zones');
    cy.get('[data-cy=zone-name]').eq(0).should('contain.text', 'cloudscale.ch LPG 0');
    cy.get('[data-cy=zone-name]').eq(1).should('contain.text', 'cloudscale.ch LPG 2');
  });

  it('empty list', () => {
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'appuio.io' });
    cy.visit('/zones');
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones', {
      body: createZoneList({ items: [] }),
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
