export interface OrganizationMembers {
  kind: 'OrganizationMembers';
  apiVersion: 'appuio.io/v1';
  metadata: {
    [key: string]: unknown;
    namespace: string;
  };
  spec: {
    userRefs: {
      name: string;
    }[];
  };
  editMembers?: boolean;
}

export interface OrganizationMemberList {
  kind: 'OrganizationMemberList';
  apiVersion: 'appuio.io/v1';
  metadata: object;
  items: OrganizationMembers[];
}
