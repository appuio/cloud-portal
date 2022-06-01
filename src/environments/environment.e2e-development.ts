import { defaultZonesConfig, EnvironmentType } from './environment.type';

export const environment: EnvironmentType = {
  production: true,
  appConfig: {
    version: '1.0',
    environment: 'Development',
    issuer: 'https://id.dev.appuio.cloud/auth/realms/development',
    clientId: 'local-dev',
    server: '',
    glitchTipDsn: '',
    zones: defaultZonesConfig,
  },
};
