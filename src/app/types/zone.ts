export interface Zone {
  kind: 'Zone';
  apiVersion: 'appuio.io/v1';
  metadata: {
    name: string;
    [key: string]: unknown;
  };
  data: {
    displayName: string;
    features: {
      openshiftVersion: string;
      kubernetesVersion: string;
      sdnPlugin: string;
    };
    urls: {
      console: string;
      kubernetesAPI: string;
      registry: string;
      logging: string;
    };
    cname: string;
    defaultAppDomain: string;
    gatewayIPs: string[];
    cloudProvider: {
      name: string;
      zones: string[];
      region: string;
    };
  };
}

export interface ZoneList {
  kind: 'ZoneList';
  apiVersion: 'appuio.io/v1';
  metadata: object;
  items: Zone[];
}
