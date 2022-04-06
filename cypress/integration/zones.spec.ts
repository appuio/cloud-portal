import { createUser } from './user.spec';
import { ZoneCloudProvider, Zone, ZoneList, ZoneUrls, ZoneFeatures } from '../../src/app/types/zone';

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
    cy.get(':nth-child(2) > .flex-row > .text-3xl').should('contain.text', 'cloudscale.ch LPG 0');
    cy.get(':nth-child(3) > .flex-row > .text-3xl').should('contain.text', 'cloudscale.ch LPG 2');
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

export interface ZoneListConfig {
  items: Zone[];
}

export interface ZoneConfig {
  name: string;
  displayName: string;
  features: ZoneFeatures;
  urls: ZoneUrls;
  cname: string;
  defaultAppDomain: string;
  gatewayIPs: string[];
  cloudProvider: ZoneCloudProvider;
}

export const zoneCloudscale1 = createZone({
  name: 'cloudscale.ch AG',
  displayName: 'cloudscale.ch LPG 0',
  features: { kubernetesVersion: '1.21', openshiftVersion: '4.8', sdnPlugin: 'OVN-Kubernetes' },
  cname: 'cname.cloudscale-lpg-0.appuio.cloud',
  cloudProvider: {
    name: 'cloudscale.ch',
    region: 'Lupfig (AG)',
    zones: ['lpg1'],
  },
  gatewayIPs: ['185.98.123.122'],
  defaultAppDomain: 'apps.cloudscale-lpg-0.appuio.cloud',
  urls: {
    console: 'https://console.cloudscale-lpg-0.appuio.cloud/',
    kubernetesAPI: 'https://api.cloudscale-lpg-0.appuio.cloud:6443/',
    logging: 'https://logging.cloudscale-lpg-0.appuio.cloud/',
    registry: 'https://registry.cloudscale-lpg-0.appuio.cloud',
  },
});
export const zoneCloudscale2 = createZone({
  name: 'cloudscale.ch AG',
  displayName: 'cloudscale.ch LPG 2',
  features: { kubernetesVersion: '1.21', openshiftVersion: '4.8', sdnPlugin: 'OVN-Kubernetes' },
  cname: 'cname.cloudscale-lpg-2.appuio.cloud',
  cloudProvider: {
    name: 'cloudscale.ch',
    region: 'Lupfig (AG)',
    zones: ['lpg2'],
  },
  gatewayIPs: ['185.98.123.122'],
  defaultAppDomain: 'apps.cloudscale-lpg-2.appuio.cloud',
  urls: {
    console: 'https://console.cloudscale-lpg-2.appuio.cloud/',
    kubernetesAPI: 'https://api.cloudscale-lpg-2.appuio.cloud:6443/',
    logging: 'https://logging.cloudscale-lpg-2.appuio.cloud/',
    registry: 'https://registry.cloudscale-lpg-2.appuio.cloud',
  },
});

export function createZone(zoneConfig: ZoneConfig): Zone {
  return {
    kind: 'Zone',
    apiVersion: 'appuio.io/v1',
    metadata: {
      name: zoneConfig.name,
    },
    data: {
      displayName: zoneConfig.displayName,
      features: zoneConfig.features,
      urls: zoneConfig.urls,
      cname: zoneConfig.cname,
      defaultAppDomain: zoneConfig.defaultAppDomain,
      gatewayIPs: zoneConfig.gatewayIPs,
      cloudProvider: zoneConfig.cloudProvider,
    },
  };
}

export function createZoneList(zoneListConfig: ZoneListConfig): ZoneList {
  return {
    kind: 'ZoneList',
    apiVersion: 'appuio.io/v1',
    metadata: {},
    items: zoneListConfig.items,
  };
}
