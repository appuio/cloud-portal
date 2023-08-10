import { AppConfig } from '../app/app-config.service';
import { EnvironmentProviders, Provider } from '@angular/core';

export interface EnvironmentType {
  production: boolean;
  appConfig?: AppConfig;
  environmentSpecificModules: EnvironmentProviders[] | Provider[];
}

export const defaultZonesConfig = {
  zoneFeatures: {
    kubernetesVersion: {
      textColor: 'white',
      backgroundColor: '#3371e3',
      label: 'Kubernetes',
    },
    openshiftVersion: {
      textColor: 'white',
      backgroundColor: '#EE0000',
      label: 'OpenShift',
    },
    sdnPlugin: {
      textColor: '#0b3046',
      backgroundColor: '#ffd902',
      label: 'SDN Plugin',
    },
    memoryCPUratio: {
      label: 'Memory CPU Ratio',
      textColor: 'white',
      backgroundColor: '#0b3046',
    },
  },
  zoneURLLabels: {
    kubernetesAPI: 'Kubernetes API',
    oauth: 'API Token',
  },
  consoleUrlKey: 'console',
};
