export interface OrganizationMembers {
  kind: 'OrganizationMembers';
  apiVersion: 'appuio.io/v1';
  metadata: {
    [key: string]: unknown;
    namespace: 'string';
    ownerReferences: {
      [key: string]: unknown;
      name: string;
    }[];
  };
  spec: {
    userRefs: {
      name: string;
    }[];
  };
}
