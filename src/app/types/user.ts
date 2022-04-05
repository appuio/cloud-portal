export interface UserSpec {
  preferences?: {
    defaultOrganizationRef?: string | null;
  };
}

export interface User {
  kind: 'User';
  apiVersion: 'appuio.io/v1';
  metadata: {
    name: string;
    [key: string]: unknown;
  };
  spec: UserSpec;
  status?: {
    id: string;
    displayName: string;
    username: string;
    email: string;
    defaultOrganizationRef: string;
  };
}

export interface UserList {
  kind: 'UserList';
  apiVersion: 'appuio.io/v1';
  metadata: object;
  items: User[];
}
