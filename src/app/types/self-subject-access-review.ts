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
  spec: { resourceAttributes: { resource: string; namespace: string; verb: string; group: string; name?: string } };
  status?: { reason: string; allowed: boolean };
}

export function newSelfSubjectAccessReview(
  verb: string,
  resource: string,
  group: string,
  namespace: string,
  name?: string
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
        name: name,
      },
    },
  };
}

export function newSelfSubjectAccessReviewFromId(key: string): SelfSubjectAccessReview {
  const attr = decomposeSsarId(key);
  return newSelfSubjectAccessReview(attr.verb, attr.resource, attr.group, attr.namespace, attr.name);
}

export function newIdFromSelfSubjectAccessReview(ssar: SelfSubjectAccessReview): string {
  const attr = ssar.spec.resourceAttributes;
  return `${attr.group}/${attr.resource}/${attr.verb}/${attr.namespace ?? ''}/${attr.name ?? ''}`;
}

export function decomposeSsarId(key: string): {
  resource: string;
  group: string;
  namespace: string;
  verb: string;
  name: string;
} {
  const arr = key.split('/');
  if (arr.length >= 4) {
    return {
      group: arr[0],
      resource: arr[1],
      verb: arr[2],
      namespace: arr[3],
      name: arr[4],
    };
  }
  return { group: '', resource: '', namespace: '', verb: '', name: '' };
}
