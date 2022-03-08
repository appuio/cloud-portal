export interface User {
  kind: 'User';
  apiVersion: 'appuio.io/v1';
  metadata: {
    name: string;
    [key: string]: unknown;
  };
  spec: {
    preferences: {
      defaultOrganizationRef: string;
    };
  };
  status: {
    id: string;
    displayName: string;
    username: string;
    email: string;
    defaultOrganizationRef: string;
  };
}