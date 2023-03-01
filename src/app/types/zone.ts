import { KubeObject } from './entity';

export const ZonePermissions = { group: 'appuio.io', resource: 'zones' };

export interface ZoneCloudProvider {
  name: string;
  zones: string[];
  region: string;
}

export interface Zone extends KubeObject {
  kind: 'Zone';
  apiVersion: 'appuio.io/v1';
  data: {
    displayName: string;
    features: { [key: string]: string };
    urls: { [key: string]: string };
    cname: string;
    defaultAppDomain: string;
    gatewayIPs: string[];
    cloudProvider: ZoneCloudProvider;
  };
}

export interface ZoneList {
  kind: 'ZoneList';
  apiVersion: 'appuio.io/v1';
  metadata: object;
  items: Zone[];
}
