import { User, UserSpec } from '../../src/app/types/user';

export interface UserConfig {
  username: string;
  defaultOrganizationRef?: string;
}

export const userMigWithoutPreferences = createUser({ username: 'mig' });

export function createUser(userConfig: UserConfig): User {
  let spec: UserSpec = {};
  if (userConfig.defaultOrganizationRef) {
    spec = {
      preferences: {
        defaultOrganizationRef: userConfig.defaultOrganizationRef,
      },
    };
  }
  return {
    apiVersion: 'appuio.io/v1',
    kind: 'User',
    metadata: {
      name: userConfig.username,
      resourceVersion: '',
    },
    spec,
  };
}
