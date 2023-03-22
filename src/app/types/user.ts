import { KubeObject } from './entity';

export interface UserSpec {
  preferences?: {
    defaultOrganizationRef?: string;
  };
}

export interface User extends KubeObject {
  kind: 'User';
  apiVersion: 'appuio.io/v1';
  spec: UserSpec;
  status?: {
    id: string;
    displayName: string;
    username: string;
    email: string;
    defaultOrganization: string;
  };
}
