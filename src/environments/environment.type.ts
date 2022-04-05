export interface EnvironmentType {
  production: boolean;
  appConfig?: {
    version: string;
    environment: string;
    issuer: string;
    clientId: string;
    glitchTipDsn: string;
  };
}
