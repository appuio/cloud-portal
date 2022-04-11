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

export interface ZoneFeatures {
  openshiftVersion: string;
  kubernetesVersion: string;
  sdnPlugin: string;
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
    features: ZoneFeatures;
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
