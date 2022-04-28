export interface ZoneCloudProvider {
  name: string;
  zones: string[];
  region: string;
}

export interface ZoneUrls {
  console: string;
  kubernetesAPI: string;
  registry: string;
  logging: string;
}

export interface Zone {
  kind: 'Zone';
  apiVersion: 'appuio.io/v1';
  metadata: {
    name: string;
    [key: string]: unknown;
  };
  data: {
    displayName: string;
    features: { [key: string]: string };
    urls: ZoneUrls;
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
