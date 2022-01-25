export interface Zone {
  kind: 'Zone';
  apiVersion: string;
  metadata: object;
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
  apiVersion: string;
  metadata: {
    continue: string;
    resourceVersion: string;
  };
  items: Zone[];
}
