import { zoneCloudscale1, zoneCloudscale2 } from '../fixtures/zone';
import { createUser } from '../fixtures/user';
import { ZonePermissions } from '../../src/app/types/zone';

describe('Test zones', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
    cy.disableCookieBanner();
  });
  beforeEach(() => {
    // needed for initial getUser request
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'nxt' }),
    });
  });

  it('list with two entries', () => {
    cy.setPermission({ verb: 'list', ...ZonePermissions });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones', {
      body: { items: [zoneCloudscale1, zoneCloudscale2] },
    });
    cy.visit('/zones');
    cy.get('#zones-title').should('contain.text', 'Zones');
    cy.get('[data-cy=zone-name]').eq(0).should('contain.text', 'cloudscale.ch LPG 0');
    cy.get('[data-cy=zone-name]').eq(1).should('contain.text', 'cloudscale.ch LPG 2');
  });

  it('empty list', () => {
    cy.setPermission({ verb: 'list', ...ZonePermissions });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones', {
      body: { items: [] },
    });
    cy.visit('/zones');
    cy.get('#zones-title').should('contain.text', 'Zones');
    cy.get('#no-zone-message').should('contain.text', 'No zones available.');
  });

  it('request failed', () => {
    cy.setPermission({ verb: 'list', ...ZonePermissions });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones', {
      statusCode: 403,
    });
    cy.visit('/zones');
    cy.get('#zones-title').should('contain.text', 'Zones');
    cy.get('#zone-failure-message').should('contain.text', 'Zones could not be loaded.');
  });

  it('failed requests are retried', () => {
    cy.setPermission({ verb: 'list', ...ZonePermissions });
    let interceptCount = 0;

    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones', (req) => {
      if (interceptCount === 0) {
        interceptCount++;
        req.reply({ statusCode: 504 });
      } else {
        req.reply({ items: [zoneCloudscale1, zoneCloudscale2] });
      }
    }).as('getZones');

    cy.visit('/zones');
    cy.get('#zones-title').should('contain.text', 'Zones');
    cy.get('[data-cy=zone-name]').eq(0).should('contain.text', 'cloudscale.ch LPG 0');
  });

  it('no permission', () => {
    cy.visit('/zones');
    cy.get('h1').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
  });
});

describe('Test single zone', () => {
  beforeEach(() => {
    cy.setupAuth();
    window.localStorage.setItem('hideFirstTimeLoginDialog', 'true');
    cy.disableCookieBanner();
  });
  beforeEach(() => {
    // needed for initial getUser request
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'nxt' }),
    });
  });

  it('displays zone details', () => {
    cy.setPermission({ verb: 'list', ...ZonePermissions });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones/cloudscale-lpg-2', {
      body: zoneCloudscale2,
    });
    cy.visit('/zones/cloudscale-lpg-2');
    cy.get('#zone-details-title').should('contain.text', 'Zone Details');
    cy.get('[data-cy=zone-name]').eq(0).should('contain.text', 'cloudscale.ch LPG 2');
    cy.contains('API Token').should('exist');
    cy.contains('Logging').should('exist');
  });

  it('zone with that name does not exist', () => {
    cy.setPermission({ verb: 'list', ...ZonePermissions });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones/cloudscale-lpg-4', {
      statusCode: 404,
    });
    cy.visit('/zones/cloudscale-lpg-4');
    cy.get('#zone-details-title').should('contain.text', 'Zone Details');
    cy.get('#zone-failure-message').should('contain.text', 'Zone could not be loaded.');
  });

  it('request failed', () => {
    cy.setPermission({ verb: 'list', ...ZonePermissions });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones', {
      statusCode: 403,
    });
    cy.visit('/zones/cloudscale-lpg-2');
    cy.get('#zone-details-title').should('contain.text', 'Zone Details');
    cy.get('#zone-failure-message').should('contain.text', 'Zone could not be loaded.');
  });

  it('no permission', () => {
    cy.visit('/zones/cloudscale-lpg-0');
    cy.get('h1').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
  });
});
