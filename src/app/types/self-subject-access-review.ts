import { KubeObject } from './entity';

export declare type SelfSubjectAccessReviewAttributes = {
  group: string;
  resource: string;
  verb: string;
  namespace?: string;
};

export interface SelfSubjectAccessReview extends KubeObject {
  kind: 'SelfSubjectAccessReview';
  apiVersion: 'authorization.k8s.io/v1';
  spec: { resourceAttributes: { resource: string; namespace: string; verb: string; group: string } };
  status?: { reason: string; allowed: boolean };
}

export function newSelfSubjectAccessReview(
  verb: string,
  resource: string,
  group: string,
  namespace: string
): SelfSubjectAccessReview {
  return {
    kind: 'SelfSubjectAccessReview',
    apiVersion: 'authorization.k8s.io/v1',
    metadata: {
      name: '',
    },
    spec: {
      resourceAttributes: {
        verb: verb,
        resource: resource,
        group: group,
        namespace: namespace,
      },
    },
  };
}

export function newSelfSubjectAccessReviewFromId(key: string): SelfSubjectAccessReview {
  const attr = decomposeSsarId(key);
  return newSelfSubjectAccessReview(attr.verb, attr.resource, attr.group, attr.namespace);
}

export function newIdFromSelfSubjectAccessReview(ssar: SelfSubjectAccessReview): string {
  return `${ssar.spec.resourceAttributes.group}/${ssar.spec.resourceAttributes.resource}/${
    ssar.spec.resourceAttributes.namespace ?? ''
  }/${ssar.spec.resourceAttributes.verb}`;
}

export function decomposeSsarId(key: string): { resource: string; group: string; namespace: string; verb: string } {
  const arr = key.split('/');
  if (arr.length === 4) {
    return {
      group: arr[0],
      resource: arr[1],
      namespace: arr[2],
      verb: arr[3],
    };
  }
  return { group: '', resource: '', namespace: '', verb: '' };
}
