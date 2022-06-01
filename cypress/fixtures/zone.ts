import { Zone, ZoneCloudProvider, ZoneList } from '../../src/app/types/zone';

export interface ZoneListConfig {
  items: Zone[];
}

export interface ZoneConfig {
  name: string;
  displayName: string;
  features: { [key: string]: string };
  urls: { [key: string]: string };
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
    oauth: 'https://oauth-openshift.cloudscale-lpg-0.appuio.cloud/oauth/token/display',
  },
});

export const zoneCloudscale2 = createZone({
  name: 'cloudscale-lpg-2',
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
    oauth: 'https://oauth-openshift.cloudscale-lpg-2.appuio.cloud/oauth/token/display',
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
