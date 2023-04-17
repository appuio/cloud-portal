// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.production.ts`.
// The list of file replacements can be found in `angular.json`.

// this environment is used as a template for environment.development.ts which is developer-specific

import { defaultZonesConfig, EnvironmentType } from './environment.type';

export const environment: EnvironmentType = {
  production: false,
  appConfig: {
    version: '1.0',
    environment: 'Development',
    issuer: 'https://id.dev.appuio.cloud/auth/realms/development',
    clientId: 'development',
    server: '',
    glitchTipDsn: '',
    zones: defaultZonesConfig,
    countries: [
      { code: 'CH', name: 'Switzerland' },
      { code: 'DE', name: 'Germany' },
      { code: 'AT', name: 'Austria' },
      { code: 'LI', name: 'Liechtenstein' },
    ],
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
