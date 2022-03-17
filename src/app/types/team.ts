export interface Team {
  kind: 'Team';
  apiVersion: 'appuio.io/v1';
  metadata: {
    name: string;
    namespace: string;
    [key: string]: unknown;
  };
  spec: {
    displayName: string;
    userRefs: UserRef[];
  };
}

export interface UserRef {
  name: string;
}
