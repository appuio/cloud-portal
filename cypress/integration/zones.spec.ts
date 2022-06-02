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

  it('failed requests are retried', () => {
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'appuio.io' });
    cy.visit('/zones');

    let interceptCount = 0;
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones', (req) => {
      if (interceptCount === 0) {
        interceptCount++;
        req.reply({ statusCode: 504 });
      } else {
        req.reply(createZoneList({ items: [zoneCloudscale1, zoneCloudscale2] }));
      }
    }).as('getZones');

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
  });
  beforeEach(() => {
    // needed for initial getUser request
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'rbac.appuio.io' });
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/users/mig', {
      body: createUser({ username: 'mig', defaultOrganizationRef: 'nxt' }),
    });
  });

  it('displays zone details', () => {
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'appuio.io' });
    cy.visit('/zones/cloudscale-lpg-2');
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones', {
      body: createZoneList({ items: [zoneCloudscale1, zoneCloudscale2] }),
    });
    cy.get('#zone-details-title').should('contain.text', 'Zone Details');
    cy.get('[data-cy=zone-name]').eq(0).should('contain.text', 'cloudscale.ch LPG 2');
  });

  it('displays zone details of zone with non-url conform name', () => {
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'appuio.io' });
    cy.visit('/zones/cloudscale_ch-ag');
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones', {
      body: createZoneList({ items: [zoneCloudscale1, zoneCloudscale2] }),
    });
    cy.get('#zone-details-title').should('contain.text', 'Zone Details');
    cy.get('[data-cy=zone-name]').eq(0).should('contain.text', 'cloudscale.ch LPG 0');
  });

  it('zone with that name does not exist', () => {
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'appuio.io' });
    cy.visit('/zones/cloudscale-lpg-4');
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones', {
      body: createZoneList({ items: [zoneCloudscale1, zoneCloudscale2] }),
    });
    cy.get('#zone-details-title').should('contain.text', 'Zone Details');
    cy.get('#no-zone-message').should('contain.text', 'No zone found.');
  });

  it('request failed', () => {
    cy.setPermission({ verb: 'list', resource: 'zones', group: 'appuio.io' });
    cy.visit('/zones/cloudscale-lpg-2');
    cy.intercept('GET', 'appuio-api/apis/appuio.io/v1/zones', {
      statusCode: 403,
    });
    cy.get('#zone-details-title').should('contain.text', 'Zone Details');
    cy.get('#zone-failure-message').should('contain.text', 'Zone could not be loaded.');
  });

  it('no permission', () => {
    cy.visit('/zones/cloudscale-lpg-0');
    cy.get('h1').should('contain.text', 'Welcome to the APPUiO Cloud Portal');
  });
});
